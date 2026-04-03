import * as _ from 'lodash';
import { omit, pick } from './functions';

export const buildSearchQuery = (options: any, searchableCols: string[]) => {
  const where: any = {};
  const searchArray: any[] = [];
  
  if (!_.isEmpty(options)) {
    const keys = Object.keys(options);
    keys.forEach((key) => {
      const searchValue = options[key];
      
      if (key === 'accountId') {
        where.accountId = parseInt(searchValue, 10);
      }

      if (key === 'status') {
        where.status = searchValue;
      }

      if (key === 'search' && searchValue) {
        searchableCols.forEach((col) => {
          let data: any;

          if (!col.toLowerCase().includes('id')) {
            data = {
              [col]: { contains: searchValue, mode: 'insensitive' },
            };
          }

          if (col.includes('.')) {
            const [relation, column, subColumn] = col.split('.');
            if (subColumn) {
              data = {
                [relation]: {
                  [column]: {
                    [subColumn]: { contains: searchValue, mode: 'insensitive' },
                  },
                },
              };
            } else {
              data = {
                [relation]: {
                  [column]: { contains: searchValue, mode: 'insensitive' },
                },
              };
            }
          }

          if (data) searchArray.push(data);
        });
        
        if (searchArray.length) where.OR = searchArray;
      } else {
        if (searchableCols.includes(key)) {
          if (key.includes('Id')) {
            where[key] = parseInt(searchValue, 10);
          } else if (key !== 'status') {
            where[key] = { contains: searchValue, mode: 'insensitive' };
          }
        }
      }
    });
  }
  return where;
};

export const buildQueryOptions = (option: any) => {
  const searchQuery = omit(option.query, ['limit', 'page', 'sort_by']);
  let options = {
    limit: option.limit,
    offset: option.skip,
    key: option.key,
    dir: option.dir,
  };
  options = _.merge(options, searchQuery);
  return options;
};

export const buildRelations = (relations: string[]) => {
  if (!relations || !relations.length) return undefined;
  
  const relationObj: any = {};
  relations.forEach((relation) => {
    if (relation.includes('.')) {
      const parts = relation.split('.');
      let current = relationObj;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = true;
        } else {
          current[part] = current[part] || { include: {} };
          if (current[part] === true) current[part] = { include: {} };
          current = current[part].include;
        }
      }
    } else {
      relationObj[relation] = true;
    }
  });

  return relationObj;
};

export const buildFillable = (data: any, fillable: string[]) =>
  fillable.length ? pick(data, fillable) : data;

export const buildCreateOrUpdate = (data: any, fillable: string[]) => {
  const fillableObj = buildFillable(data, fillable);

  return Object.keys(fillableObj).reduce((memo: any, key) => {
    if (key.includes('Id') && key !== 'identityCode') {
      const [relation] = key.split('Id');
      memo[relation] = {
        connect: { id: fillableObj[key] },
      };
    } else {
      memo[key] = fillableObj[key];
    }
    return memo;
  }, {});
};
