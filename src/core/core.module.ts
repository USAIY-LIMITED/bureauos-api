import { Global, Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { ApiGatewayModule } from './api-gateway/api-gateway.module';
import { BaseRecordsModule } from './base-records/base-records.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

@Global()
@Module({
  imports: [
    ApiGatewayModule,
    BaseRecordsModule,
    AuditLogsModule,
  ],
  providers: [PrismaService],
  exports: [
    PrismaService,
    ApiGatewayModule,
    BaseRecordsModule,
    AuditLogsModule,
  ],
})
export class CoreModule {}
