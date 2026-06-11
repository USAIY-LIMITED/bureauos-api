import { AccountDatabaseService } from '@app/accounts/accounts.db.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '@app/users/users.service';
import { PrismaService } from '@app/core/database/prisma.service';
import { AccountType, Prisma } from '@prisma/client';
import {
  generateRandomDigits,
  generateUserIdentityCode,
  pick,
} from '@app/core/utils/functions';
import { EmailManagementsService } from '@app/email-managements/email-managements.service';
import { ValidationException } from '@app/core/utils/errors/http-error.filter';
import { AuditLogsService } from '@app/core/audit-logs/audit-logs.service';
import type { CurrentUserData } from '@app/iam/interfaces';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountsDbService: AccountDatabaseService,
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly mailService: EmailManagementsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(filterOptions, paginationOptions) {
    if (
      filterOptions.type &&
      Object.keys(AccountType).includes(filterOptions.type)
    ) {
      const [data, totalCount] = await this.accountsDbService.findAll(
        { ...filterOptions },
        paginationOptions,
      );
      return { data, totalCount };
    }

    throw new ValidationException({ type: 'Account type is required' });
  }

  async findOne(
    id: number,
    relations: string[] = [],
    actor?: CurrentUserData,
  ) {
    this.ensureAdminOrOwner(id, actor);

    const account = await this.accountsDbService.findById(id, relations);

    if (!account || account.deletedAt) {
      throw new BadRequestException('Account not found or has been deleted');
    }

    const accountTypeData = await this.accountsDbService.findAccountTypeData(
      account.id,
      account.type,
    );

    return { [account.type.toLowerCase()]: accountTypeData };
  }

  async create(data: any) {
    const accountData = {
      ...data,
      email: data.email.toLowerCase(),
      firstName: data.firstName?.toUpperCase(),
      lastName: data.lastName?.toUpperCase(),
    };

    const userData = {
      ...accountData,
      isActivated: accountData.isActivated ?? false,
    };

    try {
      const identityCode = generateUserIdentityCode();
      const accountDataWithIdentity = { ...accountData, identityCode };

      let createdAccount: any;

      await this.prismaService.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const user = await this.userService.create(userData, tx);
          createdAccount = await this.accountsDbService.create(
            { ...accountDataWithIdentity, userId: user.id },
            tx,
          );

          await this.sendWelcomeNotification(accountData.accountType, {
            to: accountData.email,
            id: createdAccount.id,
            firstName: accountData.firstName,
            lastName: accountData.lastName,
            email: accountData.email,
          });

          return createdAccount;
        },
        { maxWait: 10000, timeout: 50000 },
      );

      this.auditLogsService
        .log({
          action: 'CREATED',
          entity: 'Account',
          entityId: String(createdAccount?.id),
          details: { type: accountData.accountType, email: accountData.email },
        })
        .catch(() => {});

      return createdAccount;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new BadRequestException('User already exists');
      }
      console.error(e);
      throw new BadRequestException('Something went wrong');
    }
  }

  async update(id: number, data: any, actor?: CurrentUserData) {
    this.ensureAdminOrOwner(id, actor);

    const account = await this.accountsDbService.update(id, data);
    const userData = pick(data, ['firstName', 'lastName', 'email']);
    const userId = account?.users[0]?.id;

    if (userId) {
      await this.userService.update(userId, userData);
    }

    this.auditLogsService
      .log({
        userId: actor?.id ?? userId,
        action: 'UPDATED',
        entity: 'Account',
        entityId: String(id),
      })
      .catch(() => {});

    return account;
  }

  async delete(id: number, actorUserId?: number) {
    const result = await this.accountsDbService.delete(id);

    this.auditLogsService
      .log({
        userId: actorUserId,
        action: 'DELETED',
        entity: 'Account',
        entityId: String(id),
      })
      .catch(() => {});

    return result;
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findFirst({
      where: { email },
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

  private async sendWelcomeNotification(accountType: string, data: any) {
    await this.mailService
      .sendMail(data.to, 'account-welcome', {
        firstName: data.firstName,
        accountType,
      })
      .catch(() => {});
  }

  private ensureAdminOrOwner(id: number, actor?: CurrentUserData) {
    if (!actor) return;

    if (
      actor.account.type !== AccountType.ADMIN &&
      actor.account.id !== id
    ) {
      throw new ForbiddenException('You do not have access to this account');
    }
  }
}
