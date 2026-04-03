import {
  buildFillable,
  buildRelations,
  buildSearchQuery,
} from '../utils/db-query';

export abstract class BaseDatabaseService {
  public fillable: string[] = [];
  public searchable: string[] = [];
  public relations: string[] = [];
  protected model: any;

  protected constructor(model: any) {
    this.model = model;
  }

  async create(data: any) {
    return this.model.create({
      data: buildFillable(data, this.fillable),
    });
  }

  async update(id: number, data: any) {
    return await this.model.update({
      where: { id, deletedAt: null },
      data: buildFillable(data, this.fillable),
    });
  }

  async updateWithAccountId(accountId: number, data: any) {
    return await this.model.update({
      where: { accountId, deletedAt: null },
      data: buildFillable(data, this.fillable),
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
        [sortKey]: sortDir || 'desc',
      };
    }

    const buildWhere = buildSearchQuery(searchOptions, this.searchable);
    buildWhere.deletedAt = null;

    queryOptions.where = buildWhere;
    queryOptions.include = buildRelations(activeRelations);

    return Promise.all([
      this.model.findMany(queryOptions),
      this.model.count({ where: buildWhere }),
    ]);
  }

  async findById(id: number | string, relations: string[] = []) {
    const activeRelations = relations?.length ? relations : this.relations;
    const options: any = {
      where: { id, deletedAt: null },
    };

    if (activeRelations.length) {
      options.include = buildRelations(activeRelations);
    }

    return this.model.findUnique(options);
  }

  async findBySlug(slug: string, relations: string[] = []) {
    const activeRelations = relations?.length ? relations : this.relations;
    const options: any = {
      where: { slug, deletedAt: null },
    };

    if (activeRelations.length) {
      options.include = buildRelations(activeRelations);
    }

    return this.model.findUnique(options);
  }

  async findFirst(where: any, relations: string[] = []) {
    const activeRelations = relations?.length ? relations : this.relations;
    const options: any = {
      where: { ...where, deletedAt: null },
    };

    if (activeRelations.length) {
      options.include = buildRelations(activeRelations);
    }

    return this.model.findFirst(options);
  }

  async delete(id: number | string) {
    return this.model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async forceDelete(id: number | string) {
    return this.model.delete({
      where: { id },
    });
  }
}
