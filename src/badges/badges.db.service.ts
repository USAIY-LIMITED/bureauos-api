import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from '@app/core/database/base.db.service';
import { PrismaService } from '@app/core/database/prisma.service';

@Injectable()
export class BadgeDefinitionsDbService extends BaseDatabaseService {
  public searchable = ['slug', 'track', 'tier'];
  public fillable = ['slug', 'track', 'tier', 'cap'];

  constructor(prisma: PrismaService) {
    super(prisma.badgeDefinition);
  }
}

@Injectable()
export class AccountBadgesDbService extends BaseDatabaseService {
  public searchable = ['badgeSlug'];
  public fillable = [
    'accountId',
    'badgeSlug',
    'earnedAt',
    'revokedAt',
    'serialNumber',
  ];
  public relations = ['badge'];

  constructor(prisma: PrismaService) {
    super(prisma.accountBadge);
  }
}
