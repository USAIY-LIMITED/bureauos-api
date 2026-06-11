import { Global, Module } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsDbService } from './audit-logs.db.service';

@Global()
@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsService, AuditLogsDbService],
  exports: [AuditLogsService, AuditLogsDbService],
})
export class AuditLogsModule {}
