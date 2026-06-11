import { Injectable } from '@nestjs/common';
import { ApiGatewayDbService } from './api-gateway.db.service';

@Injectable()
export class ApiGatewayService {
  constructor(
    private readonly apiGatewayDbService: ApiGatewayDbService,
  ) {}

  async create(data: any) {
    return await this.apiGatewayDbService.create(data);
  }

  async findAll(filterOptions: any = {}, paginationOptions: any = {}) {
    const [data, totalCount] = await this.apiGatewayDbService.findAll(filterOptions, paginationOptions);
    return { data, totalCount: Number(totalCount) };
  }

  async findOne(id: number) {
    return await this.apiGatewayDbService.findById(id);
  }

  async validateKey(key: string) {
    return await this.apiGatewayDbService.findFirst({ key, isEnabled: true });
  }

  async update(id: number, data: any) {
    return await this.apiGatewayDbService.update(id, data);
  }

  async delete(id: number) {
    return await this.apiGatewayDbService.forceDelete(id);
  }
}
