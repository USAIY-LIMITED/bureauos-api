import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/core/database/prisma.service';

export interface LogParams {
  userId?: number;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
}

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async log(params: LogParams) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details || {},
      },
    });
  }

  async findAll(filters?: { userId?: number; entity?: string }) {
    return this.prisma.auditLog.findMany({
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
