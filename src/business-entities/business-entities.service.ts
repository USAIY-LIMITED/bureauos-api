import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessEntitiesDbService } from './business-entities.db.service';
import { CreateBusinessEntityDto } from './dto/create-business-entity.dto';
import { UpdateBusinessEntityDto } from './dto/update-business-entity.dto';
import { AuditLogsService } from '@app/core/audit-logs/audit-logs.service';

@Injectable()
export class BusinessEntitiesService {
  constructor(
    private readonly entitiesDbService: BusinessEntitiesDbService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Create a new BusinessEntity under the caller's business account.
   * `businessAccountId` comes from AccountsGuard's auto-injected `accountId`
   * (req.body.accountId), never trusted directly off the DTO for non-admins.
   */
  async create(dto: CreateBusinessEntityDto, businessAccountId: number) {
    const entity = await this.entitiesDbService.create({
      ...dto,
      businessAccountId,
    });

    this.auditLogsService
      .log({
        action: 'CREATED',
        entity: 'BusinessEntity',
        entityId: String(entity.id),
        details: { name: entity.name, statusTrack: entity.statusTrack, businessAccountId },
      })
      .catch(() => {});

    return entity;
  }

  /**
   * List entities for the caller's own business account.
   */
  async findAll(filterOptions: any, paginationOptions: any) {
    const [data, totalCount] = await this.entitiesDbService.findAll(
      filterOptions,
      paginationOptions,
    );
    return { data, totalCount };
  }

  async findOne(id: number) {
    const entity = await this.entitiesDbService.findById(id);
    if (!entity) {
      throw new NotFoundException('Business entity not found');
    }
    return entity;
  }

  async update(id: number, dto: UpdateBusinessEntityDto) {
    const entity = await this.entitiesDbService.findById(id);
    if (!entity) {
      throw new NotFoundException('Business entity not found');
    }

    const updated = await this.entitiesDbService.update(id, dto);

    this.auditLogsService
      .log({
        action: 'UPDATED',
        entity: 'BusinessEntity',
        entityId: String(id),
        details: { changes: Object.keys(dto) },
      })
      .catch(() => {});

    return updated;
  }
}
