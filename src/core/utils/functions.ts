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
