import { Module } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayDbService } from './api-gateway.db.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService, ApiGatewayDbService],
  exports: [ApiGatewayService, ApiGatewayDbService],
})
export class ApiGatewayModule {}
