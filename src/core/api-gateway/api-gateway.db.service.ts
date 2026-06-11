import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from '@app/core/database/base.db.service';
import { PrismaService } from '@app/core/database/prisma.service';

@Injectable()
export class ApiGatewayDbService extends BaseDatabaseService {
  public searchable = ['name', 'slug', 'key'];
  public fillable = [
    'key',
    'slug',
    'name',
    'accountId',
    'rateLimit',
    'burstLimit',
    'isEnabled',
    'config',
  ];
  public relations = ['account'];

  constructor(private readonly prisma: PrismaService) {
    super(prisma.apiGateway);
  }

  get apiGateway() {
    return this.prisma.apiGateway;
  }
}
