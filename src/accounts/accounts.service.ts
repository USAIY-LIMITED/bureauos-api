import { AccountDatabaseService } from '@app/accounts/accounts.db.service';
import {
  BadRequestException,
  ConflictException,
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

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountsDbService: AccountDatabaseService,
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly mailService: EmailManagementsService,
  ) {}

  async findAll(filterOptions, paginationOptions) {
    if (
      filterOptions.type &&
      Object.keys(AccountType).includes(filterOptions.type)
    ) {
      const [data, totalCount] = await this.accountsDbService.findAll(
        {
          ...filterOptions,
        },
        paginationOptions,
      );
      return { data, totalCount };
    }

    throw new ValidationException({
      type: 'Account type is required',
    });
  }

  async findOne(id: number, relations: string[] = []) {
    const account = await this.accountsDbService.findById(id, relations);

    if (!account || account.deletedAt) {
      throw new BadRequestException('Account not found or has been deleted');
    }

    const accountTypeData = await this.accountsDbService.findAccountTypeData(
      account.id,
      account.type,
    );

    return {
      [account.type.toLowerCase()]: accountTypeData,
    };
  }

  async create(data) {
    const accountData = {
      ...data,
      email: data.email.toLowerCase(),
      firstName: data.firstName?.toUpperCase(),
      lastName: data.lastName?.toUpperCase(),
    };

    const userData = { ...accountData, isActivated: true };

    try {
      const identityCode = generateUserIdentityCode();
      const accountDataWithIdentity = { ...accountData, identityCode };
      
      await this.prismaService.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const user = await this.userService.create(userData, tx);
          const account = await this.accountsDbService.create(
            { ...accountDataWithIdentity, userId: user.id },
            tx,
          );

          await this.sendWelcomeNotification(accountData.accountType, {
            to: accountData.email,
            id: account.id,
            firstName: accountData.firstName,
            lastName: accountData.lastName,
            email: accountData.email,
          });
          
          return account;
        },
        { maxWait: 10000, timeout: 50000 },
      );
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

  private async sendWelcomeNotification(accountType: string, data: any) {
    const content = `<h1>Welcome to BureauOS!</h1><p>Hi ${data.firstName}, your account as ${accountType} has been created.</p>`;
    await this.mailService.sendMail(data.to, 'Welcome to BureauOS', content);
  }

  async update(id: number, data) {
    const account = await this.accountsDbService.update(id, data);
    const userData = pick(data, ['firstName', 'lastName', 'email']);
    const userId = account?.users[0]?.id;

    if (userId) {
      await this.userService.update(userId, userData);
    }

    return account;
  }

  async delete(id: number) {
    return this.accountsDbService.delete(id);
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
}
