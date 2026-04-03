import { Account, AccountType, User } from '@prisma/client';

export type JwtPayload = {
  currentAccountId: number;
  currentAccountType: string;
  email: string;
};

type AccountData = {
  account: {
    id: number;
    type: keyof typeof AccountType;
    //data: `account.${keyof typeof AccountType}`;
  };
  accounts: Account[];
};

export type CurrentUserData = User & AccountData;
