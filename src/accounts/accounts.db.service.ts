import { accountTypeMapping } from '@app/accounts/account-type.mapping';
import { Injectable } from '@nestjs/common';
import { Account, AccountType, Prisma } from '@prisma/client';
import { BaseDatabaseService } from '@app/core/database/base.db.service';
import { pick } from '@app/core/utils/functions';
import {
  buildCreateOrUpdate,
  buildRelations,
  buildSearchQuery,
} from '@app/core/utils/db-query';
import { PrismaService } from '@app/core/database/prisma.service';

@Injectable()
export class AccountDatabaseService extends BaseDatabaseService {
  public searchable: string[] = ['type'];
  public relations: string[] = ['users'];
  protected model: Prisma.AccountDelegate<any>;

  constructor(private readonly prisma: PrismaService) {
    super(prisma.account);
    this.model = prisma.account;
  }

  async findAll(
    filterOptions: any = {},
    paginationOptions: any = {},
  ): Promise<[any, any]> {
    const queryOptions: any = {};
    const { sortKey, sortDir, type, ...searchOptions } = filterOptions || {};
    const { skip, limit } = paginationOptions || {};
    
    if (!type || !AccountType[type]) {
       return [[], 0];
    }

    const accountType = type as AccountType;
    const { searchable, relations: mappingRelations } = accountTypeMapping[accountType];

    if (limit) queryOptions.take = Number(limit);
    if (skip) queryOptions.skip = Number(skip);
    if (sortKey) {
      queryOptions.orderBy = {
        [sortKey]: sortDir || 'asc',
      };
    }

    const buildWhere: any = {
      type: accountType,
      deletedAt: null,
      [accountType.toLowerCase()]: buildSearchQuery(searchOptions, searchable),
    };
    queryOptions.where = buildWhere;

    queryOptions.include = {
      users: true,
      [accountType.toLowerCase()]: {
        include: buildRelations(mappingRelations),
      },
    };

    return Promise.all([
      this.model.findMany(queryOptions),
      this.model.count({ where: buildWhere }),
    ]);
  }

  async create(data: any, tx?: Prisma.TransactionClient): Promise<Account> {
    const client = tx || this.prisma;
    const accountType = data.accountType as AccountType;
    const accountTypeRelation = accountType.toLowerCase();

    const accountData: any = {
      type: accountType,
      identityCode: data.identityCode,
      [accountTypeRelation]: {
        create: buildCreateOrUpdate(
          data,
          accountTypeMapping[accountType].fillable,
        ),
      },
      users: {
        connect: { id: data.userId },
      },
    };

    return client.account.create({
      data: accountData,
    });
  }

  async findById(id: number, relations: string[] = []) {
    return this.findFirst({ id, deletedAt: null }, relations);
  }

  async findAccountTypeData(
    accountId: number,
    accountType: keyof typeof AccountType,
    additionalRelations: string[] = [],
  ) {
    const relations = [
      ...(accountTypeMapping[accountType]?.relations || []),
      ...additionalRelations,
    ];

    const include = relations.length ? buildRelations(relations) : undefined;

    return (this.prisma[accountType.toLowerCase()] as any).findUnique({
      where: { accountId },
      include,
    });
  }

  async update(id: number, data: any) {
    const account = await this.model.findUnique({
      where: { id },
    });

    if (!account) return null;

    const accountTypeRelation = account.type.toLowerCase();

    return this.model.update({
      where: { id },
      data: {
        [accountTypeRelation]: {
          update: pick(data, accountTypeMapping[account.type].fillable),
        },
      },
      include: {
        users: true,
      },
    });
  }
}
