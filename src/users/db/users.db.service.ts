import { ConflictException, Injectable } from '@nestjs/common';
import { BaseDatabaseService } from '@app/core/database/base.db.service';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@app/core/database/prisma.service';
import { HashingService } from '@app/users/hashing.service';
import {
  buildFillable,
  buildRelations,
  buildSearchQuery,
} from '@app/core/utils/db-query';

@Injectable()
export class UserDatabaseService extends BaseDatabaseService {
  public fillable: string[] = [
    'firstName',
    'lastName',
    'password',
    'hashedRt',
    'isFirstLogin',
    'isTermsAccepted',
    'isActivated',
    'lastLogin',
    'email',
    'phoneNumber',
    'bio',
    'linkedinProfile',
    'dateOfBirth',
  ];
  public searchable = ['firstName', 'lastName', 'email'];
  public relations = ['accounts'];
  protected model: Prisma.UserDelegate<any>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
  ) {
    super(prisma.user);
    this.model = prisma.user;
  }

  async create(
    { firstName, lastName, email, password, accountId, isActivated }: any,
    tx: Prisma.TransactionClient | null = null,
  ) {
    const model = tx
      ? (tx.user as Prisma.UserDelegate<any>)
      : (this.model as Prisma.UserDelegate<any>);

    const existingUser = await model.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const hashedPassword = await this.hashingService.hashPassword(
      password || 'password',
    );

    const createData: any = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
    };

    if (typeof isActivated === 'boolean') {
      createData.isActivated = isActivated;
    }

    if (accountId) {
      createData.accounts = {
        connect: { id: accountId },
      };
    }

    return model.create({
      data: createData,
    });
  }

  async findFirstBy(options: Prisma.UserWhereInput) {
    return this.model.findFirst({
      where: options,
      include: {
        accounts: {
          include: {
            admin: true,
            business: true,
            professional: true,
          },
        },
      },
    });
  }

  async findAll(
    filterOptions: any = {},
    paginationOptions: any = {},
    relations: string[] = [],
  ) {
    const queryOptions: any = {};
    const { sortKey, sortDir, ...searchOptions } = filterOptions || {};
    const { skip, limit } = paginationOptions || {};
    const activeRelations = relations?.length ? relations : this.relations;

    if (limit) queryOptions.take = Number(limit);
    if (skip) queryOptions.skip = Number(skip);
    if (sortKey) {
      queryOptions.orderBy = {
        [sortKey]: sortDir || 'asc',
      };
    }

    let buildWhere = buildSearchQuery(searchOptions, this.searchable);
    if (searchOptions?.accountId) {
      delete buildWhere.accountId;
      buildWhere = {
        ...buildWhere,
        accounts: {
          some: { id: searchOptions.accountId },
        },
      };
    }

    queryOptions.where = { ...buildWhere, deletedAt: null };
    queryOptions.include = buildRelations(activeRelations);

    return Promise.all([
      this.model.findMany(queryOptions),
      this.model.count({ where: queryOptions.where }),
    ]);
  }

  async update(id: number, data: any, tx: any = null) {
    const model = tx ? tx.user : this.model;
    return model.update({
      where: { id },
      data: buildFillable(data, this.fillable),
    });
  }
}
