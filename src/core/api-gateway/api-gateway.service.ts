import { Injectable } from '@nestjs/common';
import { ApiGatewayDbService } from './api-gateway.db.service';
import { ApiGatewayDto } from '@app/core/dto/api-gateway.dto';
import { UpdateApiGatewayDto } from '@app/core/dto/update-api-gateway.dto';

@Injectable()
export class ApiGatewayService {
  constructor(
    private readonly apiGatewayDbService: ApiGatewayDbService,
  ) {}

  async create(data: ApiGatewayDto) {
    const gateway = await this.apiGatewayDbService.create(data);
    return this.sanitizeGateway(gateway);
  }

  async findAll(filterOptions: any = {}, paginationOptions: any = {}) {
    const [data, totalCount] = await this.apiGatewayDbService.findAll(filterOptions, paginationOptions);
    return {
      data: data.map((gateway) => this.sanitizeGateway(gateway)),
      totalCount: Number(totalCount),
    };
  }

  async findOne(id: number) {
    const gateway = await this.apiGatewayDbService.findById(id);
    return this.sanitizeGateway(gateway);
  }

  async validateKey(key: string) {
    return await this.apiGatewayDbService.findFirst({ key, isEnabled: true });
  }

  async update(id: number, data: UpdateApiGatewayDto) {
    const gateway = await this.apiGatewayDbService.update(id, data);
    return this.sanitizeGateway(gateway);
  }

  async delete(id: number) {
    const gateway = await this.apiGatewayDbService.forceDelete(id);
    return this.sanitizeGateway(gateway);
  }

  private sanitizeGateway<T extends { key?: string } | null>(gateway: T) {
    if (!gateway) return gateway;

    return {
      ...gateway,
      key: this.maskKey(gateway.key),
    };
  }

  private maskKey(key?: string) {
    if (!key) return key;

    const visibleChars = 4;
    const suffix = key.slice(-visibleChars);
    return `${'*'.repeat(Math.max(key.length - visibleChars, 0))}${suffix}`;
  }
}
