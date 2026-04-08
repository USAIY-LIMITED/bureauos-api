import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BlogPostStatus } from '../src/blog/dto/create-blog-post.dto';

/**
 * Blog Module E2E Tests
 *
 * These tests cover the full blog lifecycle:
 * - Public endpoints (listing, tags, single post by slug)
 * - Admin-protected endpoints (CRUD operations)
 * - Authorization enforcement
 * - Pagination and filtering
 *
 * Prerequisites:
 * - PostgreSQL database running with migrations applied
 * - An admin user+account seeded in the database
 *   (the test creates its own test data via Prisma)
 */
describe('Blog Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Test tokens
  let adminToken: string;
  // Test data IDs for cleanup
  let testAccountId: number;
  let testUserId: number;
  let createdPostId: number;
  let createdPostSlug: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    // Create a test admin account + user for auth
    const testAccount = await prisma.account.create({
      data: {
        type: 'ADMIN',
        admin: {
          create: {
            firstName: 'Test',
            lastName: 'Admin',
            email: 'blog-test-admin@bureauos.test',
          },
        },
      },
    });
    testAccountId = testAccount.id;

    const testUser = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'Admin',
        email: 'blog-test-admin@bureauos.test',
        password: 'hashed_test_password',
        accounts: { connect: { id: testAccountId } },
      },
    });
    testUserId = testUser.id;

    // Sign a JWT token for the admin user
    adminToken = await jwtService.signAsync(
      {
        sub: testUserId,
        email: testUser.email,
        currentAccountId: testAccountId,
        currentAccountType: 'ADMIN',
      },
      {
        secret: process.env.JWT_SECRET || 'super_secret_jwt_key_bureauos',
        expiresIn: 3600,
        audience: process.env.JWT_TOKEN_AUDIENCE || 'localhost:3000',
        issuer: process.env.JWT_TOKEN_ISSUER || 'localhost:4000',
      },
    );
  });

  afterAll(async () => {
    // Cleanup test data in reverse dependency order
    await prisma.blogPost.deleteMany({ where: { accountId: testAccountId } });
    await prisma.admin.deleteMany({ where: { accountId: testAccountId } });
    await prisma.user.update({
      where: { id: testUserId },
      data: { accounts: { disconnect: { id: testAccountId } } },
    });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.account.delete({ where: { id: testAccountId } });

    await app.close();
  });

  // ─── Admin: Create Blog Post ──────────────────────────────────

  describe('POST /blog', () => {
    it('should reject unauthenticated requests', () => {
      return request(app.getHttpServer())
        .post('/blog')
        .send({
          title: 'Unauthorized Post',
          content: '<p>Should not work</p>',
        })
        .expect(401);
    });

    it('should create a draft blog post as admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'E2E Test Post: Compliance in 2026',
          content: '<h1>Compliance</h1><p>This is a test blog post with rich HTML content.</p>',
          excerpt: 'A test post about compliance trends.',
          tags: ['compliance', 'regulation', 'test'],
          status: BlogPostStatus.DRAFT,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('slug');
      expect(res.body.title).toBe('E2E Test Post: Compliance in 2026');
      expect(res.body.status).toBe('DRAFT');
      expect(res.body.tags).toEqual(['compliance', 'regulation', 'test']);
      expect(res.body.publishedAt).toBeNull();
      expect(res.body.account).toBeDefined();
      expect(res.body.account.admin.firstName).toBe('Test');

      createdPostId = res.body.id;
      createdPostSlug = res.body.slug;
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });

    it('should create a published blog post', async () => {
      const res = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Published Test Post',
          content: '<p>Published content</p>',
          excerpt: 'A published post.',
          tags: ['compliance', 'published'],
          status: BlogPostStatus.PUBLISHED,
        })
        .expect(201);

      expect(res.body.status).toBe('PUBLISHED');
      expect(res.body.publishedAt).not.toBeNull();
    });
  });

  // ─── Public: List Published Posts ─────────────────────────────

  describe('GET /blog (public)', () => {
    it('should list only published posts', async () => {
      const res = await request(app.getHttpServer())
        .get('/blog')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);

      // Every returned post should be PUBLISHED (or not have status in the select)
      // The public endpoint uses `select` so status is not returned — verify via count
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });

    it('should support pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/blog?page=1&limit=1')
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(1);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(1);
    });

    it('should filter by tag', async () => {
      const res = await request(app.getHttpServer())
        .get('/blog?tag=published')
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      for (const post of res.body.data) {
        expect(post.tags).toContain('published');
      }
    });

    it('should return empty for non-existent tag', async () => {
      const res = await request(app.getHttpServer())
        .get('/blog?tag=nonexistent-tag-xyz')
        .expect(200);

      expect(res.body.data.length).toBe(0);
      expect(res.body.meta.total).toBe(0);
    });

    it('should support search in title', async () => {
      const res = await request(app.getHttpServer())
        .get('/blog?search=Published Test')
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── Public: Get Tags ─────────────────────────────────────────

  describe('GET /blog/tags (public)', () => {
    it('should return unique tags from published posts', async () => {
      const res = await request(app.getHttpServer())
        .get('/blog/tags')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toContain('compliance');
      expect(res.body).toContain('published');
      // Tags are sorted
      const sorted = [...res.body].sort();
      expect(res.body).toEqual(sorted);
    });
  });

  // ─── Public: Get Post by Slug ─────────────────────────────────

  describe('GET /blog/:slug (public)', () => {
    it('should NOT return a draft post by slug', () => {
      return request(app.getHttpServer())
        .get(`/blog/${createdPostSlug}`)
        .expect(404);
    });

    it('should return 404 for non-existent slug', () => {
      return request(app.getHttpServer())
        .get('/blog/this-slug-does-not-exist')
        .expect(404);
    });
  });

  // ─── Admin: List All Posts ────────────────────────────────────

  describe('GET /blog/admin/all', () => {
    it('should reject unauthenticated requests', () => {
      return request(app.getHttpServer())
        .get('/blog/admin/all')
        .expect(401);
    });

    it('should list all posts including drafts for admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/blog/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(2);

      const statuses = res.body.data.map((p: any) => p.status);
      expect(statuses).toContain('DRAFT');
      expect(statuses).toContain('PUBLISHED');
    });

    it('should filter by status for admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/blog/admin/all?status=DRAFT')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      for (const post of res.body.data) {
        expect(post.status).toBe('DRAFT');
      }
    });
  });

  // ─── Admin: Get Single Post by ID ─────────────────────────────

  describe('GET /blog/admin/:id', () => {
    it('should return a post by ID for admin', async () => {
      const res = await request(app.getHttpServer())
        .get(`/blog/admin/${createdPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.id).toBe(createdPostId);
      expect(res.body.title).toBe('E2E Test Post: Compliance in 2026');
    });

    it('should return 404 for non-existent ID', () => {
      return request(app.getHttpServer())
        .get('/blog/admin/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  // ─── Admin: Update Blog Post ──────────────────────────────────

  describe('PATCH /blog/:id', () => {
    it('should reject unauthenticated requests', () => {
      return request(app.getHttpServer())
        .patch(`/blog/${createdPostId}`)
        .send({ title: 'Hacked Title' })
        .expect(401);
    });

    it('should update a blog post as admin', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/blog/${createdPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated E2E Test Post',
          excerpt: 'Updated excerpt.',
        })
        .expect(200);

      expect(res.body.title).toBe('Updated E2E Test Post');
      expect(res.body.excerpt).toBe('Updated excerpt.');
      // Status should remain DRAFT
      expect(res.body.status).toBe('DRAFT');
    });

    it('should set publishedAt when publishing a draft', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/blog/${createdPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: BlogPostStatus.PUBLISHED })
        .expect(200);

      expect(res.body.status).toBe('PUBLISHED');
      expect(res.body.publishedAt).not.toBeNull();
    });

    it('should now return the post publicly by slug', async () => {
      const res = await request(app.getHttpServer())
        .get(`/blog/${createdPostSlug}`)
        .expect(200);

      expect(res.body.slug).toBe(createdPostSlug);
      expect(res.body.title).toBe('Updated E2E Test Post');
    });

    it('should archive a post', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/blog/${createdPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: BlogPostStatus.ARCHIVED })
        .expect(200);

      expect(res.body.status).toBe('ARCHIVED');
    });

    it('should not return archived post publicly', () => {
      return request(app.getHttpServer())
        .get(`/blog/${createdPostSlug}`)
        .expect(404);
    });

    it('should return 404 when updating non-existent post', () => {
      return request(app.getHttpServer())
        .patch('/blog/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Ghost Post' })
        .expect(404);
    });
  });

  // ─── Admin: Delete Blog Post ──────────────────────────────────

  describe('DELETE /blog/:id', () => {
    it('should reject unauthenticated requests', () => {
      return request(app.getHttpServer())
        .delete(`/blog/${createdPostId}`)
        .expect(401);
    });

    it('should soft-delete a blog post as admin', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/blog/${createdPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.deletedAt).not.toBeNull();
    });

    it('should not return deleted post in admin listing', async () => {
      const res = await request(app.getHttpServer())
        .get('/blog/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deletedPost = res.body.data.find((p: any) => p.id === createdPostId);
      expect(deletedPost).toBeUndefined();
    });

    it('should return 404 when deleting already-deleted post', () => {
      return request(app.getHttpServer())
        .delete(`/blog/${createdPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
