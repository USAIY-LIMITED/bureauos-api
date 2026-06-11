import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from '@app/core/database/base.db.service';
import { PrismaService } from '@app/core/database/prisma.service';

@Injectable()
export class AuditLogsDbService extends BaseDatabaseService {
  public searchable = ['action', 'entity', 'entityId'];
  public fillable = ['userId', 'action', 'entity', 'entityId', 'details', 'timestamp'];
  public relations = ['user'];

  constructor(private readonly prisma: PrismaService) {
    super(prisma.auditLog);
  }

  get auditLog() {
    return this.prisma.auditLog;
  }
}
