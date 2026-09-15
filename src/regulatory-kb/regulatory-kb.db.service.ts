import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from '@app/core/database/base.db.service';
import { PrismaService } from '@app/core/database/prisma.service';

@Injectable()
export class RegulatoryKbDbService extends BaseDatabaseService {
  public searchable = ['title', 'slug'];
  public fillable = ['jurisdiction', 'slug', 'title', 'description', 'activeVersionId'];
  public relations = ['activeVersion'];

  constructor(private readonly prisma: PrismaService) {
    super(prisma.regulatoryProcess);
  }

  get regulatoryProcess() {
    return this.prisma.regulatoryProcess;
  }

  get prismaClient() {
    return this.prisma;
  }
}
