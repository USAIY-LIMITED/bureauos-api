import { AccountType } from '@prisma/client';

type Options = {
  fillable: string[];
  relations: string[];
  searchable: string[];
  createDto: any;
  updateDto: any;
};

export type AccountTypeMapping = Record<AccountType, Options>;

export const accountTypeMapping: AccountTypeMapping = {
  [AccountType.ADMIN]: {
    fillable: ['firstName', 'lastName', 'email'],
    relations: [],
    searchable: ['firstName', 'lastName', 'email'],
    createDto: null,
    updateDto: null,
  },
  [AccountType.BUSINESS]: {
    fillable: [
      'companyName',
      'jurisdiction',
      'registrationNumber',
      'businessType',
    ],
    relations: [],
    searchable: ['companyName', 'registrationNumber'],
    createDto: null,
    updateDto: null,
  },
  [AccountType.PROFESSIONAL]: {
    fillable: ['primaryExpertise', 'specializations', 'licenseNumber'],
    relations: [],
    searchable: ['primaryExpertise', 'specializations', 'licenseNumber'],
    createDto: null,
    updateDto: null,
  },
};
