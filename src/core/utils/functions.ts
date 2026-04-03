import * as _ from 'lodash';

export const pick = (obj: any, keys: string[]) => {
  return _.pick(obj, keys);
};

export const omit = (obj: any, keys: string[]) => {
  return _.omit(obj, keys);
};

export const enumToArray = (enumObj: any) => {
  return Object.values(enumObj);
};

export const generateRandomDigits = (length: number): string => {
  let result = '';
  const characters = '0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const generateUserIdentityCode = (prefix = 'BOS'): string => {
  const year = new Date().getFullYear();
  const digits = generateRandomDigits(6);
  return `${prefix}-${year}-${digits}`;
};
