import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/core/database/prisma.service';
import { BaseRecordType } from '@prisma/client';
import { CreateBaseRecordDto, UpdateBaseRecordDto } from './dto/base-record.dto';

@Injectable()
export class BaseRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBaseRecordDto) {
    return this.prisma.baseRecord.create({
      data: dto,
    });
  }

  async findAll(type?: BaseRecordType) {
    return this.prisma.baseRecord.findMany({
      where: {
        type,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.baseRecord.findUnique({
      where: { slug },
    });
  }

  async update(id: number, dto: UpdateBaseRecordDto) {
    return this.prisma.baseRecord.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.baseRecord.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
