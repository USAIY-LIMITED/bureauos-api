import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from '@app/core/database/base.db.service';
import { PrismaService } from '@app/core/database/prisma.service';

@Injectable()
export class EmailManagementDbService extends BaseDatabaseService {
  public searchable = ['subject'];
  public fillable = ['subject', 'title', 'slug', 'body'];

  constructor(prisma: PrismaService) {
    super(prisma.emailTemplate);
  }
}
