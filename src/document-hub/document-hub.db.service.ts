import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from '@app/core/database/base.db.service';
import { PrismaService } from '@app/core/database/prisma.service';

@Injectable()
export class DocumentHubDbService extends BaseDatabaseService {
  public searchable = ['title', 'description'];
  public fillable = [
    'title',
    'description',
    'status',
    'dueAt',
    'closedAt',
    'createdByAccountId',
    'businessAccountId',
    'professionalAccountId',
  ];
  public relations = [
    'businessAccount',
    'professionalAccount',
    'createdByAccount',
    'documents',
    'comments',
    'activities',
  ];

  constructor(private readonly prisma: PrismaService) {
    super(prisma.documentProceeding);
  }

  get documentProceeding() {
    return this.prisma.documentProceeding;
  }

  get account() {
    return this.prisma.account;
  }

  get documentItem() {
    return this.prisma.documentItem;
  }

  get documentVersion() {
    return this.prisma.documentVersion;
  }

  get documentComment() {
    return this.prisma.documentComment;
  }

  get documentActivity() {
    return this.prisma.documentActivity;
  }

  get prismaClient() {
    return this.prisma;
  }
}
