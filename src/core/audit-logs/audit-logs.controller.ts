import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('Audit Logs')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get system audit logs, filtered by user or entity' })
  @ApiQuery({ name: 'userId', type: Number, required: false })
  @ApiQuery({ name: 'entity', type: String, required: false })
  findAll(
    @Query('userId') userId?: string,
    @Query('entity') entity?: string,
  ) {
    return this.auditLogsService.findAll({
      userId: userId ? +userId : undefined,
      entity,
    });
  }
}
