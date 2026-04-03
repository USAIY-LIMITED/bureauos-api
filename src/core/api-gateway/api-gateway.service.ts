import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ApiGatewayService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(data: any) {
    return await this.prisma.apiGateway.create({ data });
  }

  async findAll(filterOptions: any = {}, paginationOptions: any = {}) {
    const { skip, limit } = paginationOptions;
    const [data, totalCount] = await Promise.all([
      this.prisma.apiGateway.findMany({
        skip: skip ? Number(skip) : undefined,
        take: limit ? Number(limit) : undefined,
        where: { ...filterOptions },
      }),
      this.prisma.apiGateway.count({ where: { ...filterOptions } }),
    ]);
    return { data, totalCount };
  }

  async findOne(id: number) {
    return await this.prisma.apiGateway.findUnique({
      where: { id },
    });
  }

  async validateKey(key: string) {
    return await this.prisma.apiGateway.findUnique({
      where: { key, isEnabled: true },
    });
  }

  async update(id: number, data: any) {
    return await this.prisma.apiGateway.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await this.prisma.apiGateway.delete({
      where: { id },
    });
  }
}
