import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from '@app/core/database/base.db.service';
import { PrismaService } from '@app/core/database/prisma.service';

@Injectable()
export class BusinessEntitiesDbService extends BaseDatabaseService {
  public searchable = ['businessAccountId', 'name', 'statusTrack'];
  public fillable = [
    'businessAccountId',
    'name',
    'statusTrack',
    'incorporationStatus',
    'rcNumber',
    'tinNumber',
    'incorporationDate',
    'complianceScore',
    'proposedNames',
    'targetJurisdictions',
    'shareCapital',
    'industrySector',
  ];
  public relations = [];

  constructor(private readonly prisma: PrismaService) {
    super(prisma.businessEntity);
  }

  get businessEntity() {
    return this.prisma.businessEntity;
  }

  get prismaClient() {
    return this.prisma;
  }
}
