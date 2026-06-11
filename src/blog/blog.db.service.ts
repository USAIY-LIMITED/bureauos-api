import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from '@app/core/database/base.db.service';
import { PrismaService } from '@app/core/database/prisma.service';

@Injectable()
export class BlogDbService extends BaseDatabaseService {
  public searchable = ['title', 'excerpt'];
  public fillable = [
    'title',
    'slug',
    'excerpt',
    'content',
    'coverImage',
    'status',
    'publishedAt',
    'accountId',
    'tags',
  ];
  public relations = ['account'];

  constructor(private readonly prisma: PrismaService) {
    super(prisma.blogPost);
  }

  get blogPost() {
    return this.prisma.blogPost;
  }

  get prismaClient() {
    return this.prisma;
  }
}
