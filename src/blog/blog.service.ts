import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { BlogDbService } from './blog.db.service';
import { CreateBlogPostDto, BlogPostStatus } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogQueryDto } from './dto/blog-query.dto';
import { Prisma } from '@prisma/client';
import { AuditLogsService } from '@app/core/audit-logs/audit-logs.service';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogDbService: BlogDbService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Generate a URL-friendly slug from a title.
   * Appends a short random suffix to avoid collisions.
   */
  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const suffix = Math.random().toString(36).substring(2, 7);
    return `${base}-${suffix}`;
  }

  /**
   * Create a new blog post (admin only).
   */
  async create(dto: CreateBlogPostDto, accountId: number) {
    const slug = this.generateSlug(dto.title);

    // Ensure unique slug (edge case: collision)
    const existing = await this.blogDbService.findFirst({ slug });
    if (existing) {
      throw new ConflictException('Generated slug already exists. Please try again.');
    }

    const publishedAt =
      dto.status === BlogPostStatus.PUBLISHED ? new Date() : null;

    const post = await this.blogDbService.blogPost.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        tags: dto.tags || [],
        status: dto.status || BlogPostStatus.DRAFT,
        publishedAt,
        accountId,
      },
      include: {
        account: {
          select: {
            id: true,
            type: true,
            admin: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    this.auditLogsService.log({
      action: 'CREATED',
      entity: 'BlogPost',
      entityId: String(post.id),
      details: { title: post.title, status: post.status, accountId },
    }).catch(() => {});

    return post;
  }

  /**
   * List published posts for the public (with pagination, tag filter, search).
   */
  async findAllPublished(query: BlogQueryDto) {
    const page = parseInt(query.page || '1', 10) || 1;
    const limit = Math.min(parseInt(query.limit || '10', 10) || 10, 50);
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {
      status: 'PUBLISHED',
      deletedAt: null,
    };

    if (query.tag) {
      where.tags = { has: query.tag };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.blogDbService.prismaClient.$transaction([
      this.blogDbService.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          tags: true,
          publishedAt: true,
          createdAt: true,
          account: {
            select: {
              id: true,
              admin: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.blogDbService.blogPost.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single published post by slug (public).
   */
  async findBySlug(slug: string) {
    const post = await this.blogDbService.blogPost.findFirst({
      where: { slug, status: 'PUBLISHED', deletedAt: null },
      include: {
        account: {
          select: {
            id: true,
            admin: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }

  /**
   * List all posts for admin (any status, with pagination).
   */
  async findAllAdmin(query: BlogQueryDto) {
    const page = parseInt(query.page || '1', 10) || 1;
    const limit = Math.min(parseInt(query.limit || '10', 10) || 10, 50);
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.tag) {
      where.tags = { has: query.tag };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.blogDbService.prismaClient.$transaction([
      this.blogDbService.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          account: {
            select: {
              id: true,
              admin: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.blogDbService.blogPost.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single post by ID (admin — any status).
   */
  async findOneAdmin(id: number) {
    const post = await this.blogDbService.blogPost.findFirst({
      where: { id, deletedAt: null },
      include: {
        account: {
          select: {
            id: true,
            admin: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }

  /**
   * Get all unique tags from published posts (public).
   */
  async findAllTags(): Promise<string[]> {
    const posts = await this.blogDbService.blogPost.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      select: { tags: true },
    });

    const tagSet = new Set<string>();
    for (const post of posts) {
      for (const tag of post.tags) {
        tagSet.add(tag);
      }
    }

    return Array.from(tagSet).sort();
  }

  /**
   * Update a blog post (admin only).
   */
  async update(id: number, dto: UpdateBlogPostDto) {
    const post = await this.blogDbService.findFirst({ id });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    // If publishing for the first time, set publishedAt
    const data: any = { ...dto };
    if (
      dto.status === BlogPostStatus.PUBLISHED &&
      post.status !== 'PUBLISHED'
    ) {
      data.publishedAt = new Date();
    }

    const updated = await this.blogDbService.blogPost.update({
      where: { id },
      data,
      include: {
        account: {
          select: {
            id: true,
            admin: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    this.auditLogsService.log({
      action: 'UPDATED',
      entity: 'BlogPost',
      entityId: String(id),
      details: { changes: Object.keys(dto) },
    }).catch(() => {});

    return updated;
  }

  /**
   * Soft-delete a blog post (admin only).
   */
  async remove(id: number) {
    const post = await this.blogDbService.findFirst({ id });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    const deleted = await this.blogDbService.delete(id);

    this.auditLogsService.log({
      action: 'DELETED',
      entity: 'BlogPost',
      entityId: String(id),
    }).catch(() => {});

    return deleted;
  }
}
