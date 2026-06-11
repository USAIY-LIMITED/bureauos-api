import { Injectable } from '@nestjs/common';
import { AuditLogsDbService } from './audit-logs.db.service';

export interface LogParams {
  userId?: number;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
}

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogsDbService: AuditLogsDbService) {}

  async log(params: LogParams) {
    return this.auditLogsDbService.create({
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      details: params.details || {},
    });
  }

  async findAll(filters?: { userId?: number; entity?: string }) {
    return this.auditLogsDbService.auditLog.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }
}
