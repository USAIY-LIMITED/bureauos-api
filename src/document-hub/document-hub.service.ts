import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountType,
  DocumentActivityType,
  DocumentItemStatus,
  DocumentProceedingStatus,
  Prisma,
} from '@prisma/client';
import { DocumentHubDbService } from './document-hub.db.service';
import { UploadService } from '@app/core/upload/upload.service';
import { AuditLogsService } from '@app/core/audit-logs/audit-logs.service';
import type { CurrentUserData } from '@app/iam/interfaces';
import {
  CreateDocumentCommentDto,
  CreateDocumentItemDto,
  CreateDocumentProceedingDto,
  DocumentHubQueryDto,
  UpdateDocumentItemStatusDto,
  UpdateDocumentProceedingDto,
} from './dto';

@Injectable()
export class DocumentHubService {
  constructor(
    private readonly documentHubDbService: DocumentHubDbService,
    private readonly uploadService: UploadService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async createProceeding(
    dto: CreateDocumentProceedingDto,
    user: CurrentUserData,
  ) {
    const professional = await this.documentHubDbService.account.findFirst({
      where: {
        id: dto.professionalAccountId,
        type: AccountType.PROFESSIONAL,
        deletedAt: null,
      },
    });

    if (!professional) {
      throw new NotFoundException('Professional account not found');
    }

    const proceeding = await this.documentHubDbService.documentProceeding.create({
      data: {
        title: dto.title,
        description: dto.description,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        createdByAccountId: user.account.id,
        businessAccountId: user.account.id,
        professionalAccountId: dto.professionalAccountId,
      },
      include: this.proceedingInclude(),
    });

    await this.recordActivity(
      proceeding.id,
      user.account.id,
      DocumentActivityType.CREATED,
      'DocumentProceeding',
      proceeding.id,
      { title: proceeding.title },
    );

    this.auditLogsService
      .log({
        userId: user.id,
        action: 'CREATED',
        entity: 'DocumentProceeding',
        entityId: String(proceeding.id),
        details: {
          businessAccountId: user.account.id,
          professionalAccountId: dto.professionalAccountId,
        },
      })
      .catch(() => {});

    return proceeding;
  }

  async findAll(query: DocumentHubQueryDto, user: CurrentUserData) {
    const page = parseInt(query.page || '1', 10) || 1;
    const limit = Math.min(parseInt(query.limit || '20', 10) || 20, 100);
    const skip = (page - 1) * limit;
    const where: Prisma.DocumentProceedingWhereInput = {
      deletedAt: null,
    };

    if (user.account.type !== AccountType.ADMIN) {
      where.OR = [
        { businessAccountId: user.account.id },
        { professionalAccountId: user.account.id },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.AND = [
        {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [data, total] = await this.documentHubDbService.prismaClient.$transaction([
      this.documentHubDbService.documentProceeding.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.proceedingInclude(false),
      }),
      this.documentHubDbService.documentProceeding.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, user: CurrentUserData) {
    await this.ensureProceedingAccess(id, user);

    return this.documentHubDbService.documentProceeding.findFirst({
      where: { id, deletedAt: null },
      include: this.proceedingInclude(true),
    });
  }

  async updateProceeding(
    id: number,
    dto: UpdateDocumentProceedingDto,
    user: CurrentUserData,
  ) {
    await this.ensureProceedingAccess(id, user);

    const data: Prisma.DocumentProceedingUpdateInput = {
      title: dto.title,
      description: dto.description,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      status: dto.status,
      closedAt:
        dto.status === DocumentProceedingStatus.COMPLETED ||
        dto.status === DocumentProceedingStatus.CANCELLED
          ? new Date()
          : undefined,
    };

    const proceeding = await this.documentHubDbService.documentProceeding.update({
      where: { id },
      data,
      include: this.proceedingInclude(),
    });

    await this.recordActivity(
      id,
      user.account.id,
      dto.status
        ? DocumentActivityType.STATUS_CHANGED
        : DocumentActivityType.UPDATED,
      'DocumentProceeding',
      id,
      { changes: Object.keys(dto) },
    );

    return proceeding;
  }

  async createDocument(
    proceedingId: number,
    dto: CreateDocumentItemDto,
    user: CurrentUserData,
    file?: Express.Multer.File,
  ) {
    await this.ensureProceedingAccess(proceedingId, user);

    const document = await this.documentHubDbService.documentItem.create({
      data: {
        proceedingId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        status: file
          ? DocumentItemStatus.SUBMITTED
          : dto.status || DocumentItemStatus.REQUESTED,
        requestedByAccountId: user.account.id,
        uploadedByAccountId: file ? user.account.id : undefined,
      },
      include: this.documentInclude(),
    });

    await this.recordActivity(
      proceedingId,
      user.account.id,
      DocumentActivityType.DOCUMENT_ADDED,
      'DocumentItem',
      document.id,
      { title: document.title },
    );

    if (!file) return document;

    return this.uploadVersion(document.id, user, file);
  }

  async uploadVersion(
    documentId: number,
    user: CurrentUserData,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Document file is required');
    }

    const document = await this.ensureDocumentAccess(documentId, user);
    const latest = await this.documentHubDbService.documentVersion.aggregate({
      where: { documentId },
      _max: { versionNumber: true },
    });
    const versionNumber = (latest._max.versionNumber || 0) + 1;
    const upload = await this.uploadService.uploadFile(
      file,
      `document-hub/proceedings/${document.proceedingId}/documents/${documentId}`,
    );

    await this.documentHubDbService.prismaClient.$transaction([
      this.documentHubDbService.documentVersion.create({
        data: {
          documentId,
          versionNumber,
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          storageKey: upload.key,
          url: upload.url,
          uploadedByAccountId: user.account.id,
        },
      }),
      this.documentHubDbService.documentItem.update({
        where: { id: documentId },
        data: {
          status: DocumentItemStatus.SUBMITTED,
          uploadedByAccountId: user.account.id,
        },
      }),
    ]);

    await this.recordActivity(
      document.proceedingId,
      user.account.id,
      DocumentActivityType.VERSION_UPLOADED,
      'DocumentVersion',
      documentId,
      { documentId, versionNumber, fileName: file.originalname },
    );

    return this.documentHubDbService.documentItem.findFirst({
      where: { id: documentId, deletedAt: null },
      include: this.documentInclude(),
    });
  }

  async updateDocumentStatus(
    documentId: number,
    dto: UpdateDocumentItemStatusDto,
    user: CurrentUserData,
  ) {
    const document = await this.ensureDocumentAccess(documentId, user);

    const updated = await this.documentHubDbService.documentItem.update({
      where: { id: documentId },
      data: { status: dto.status },
      include: this.documentInclude(),
    });

    await this.recordActivity(
      document.proceedingId,
      user.account.id,
      DocumentActivityType.STATUS_CHANGED,
      'DocumentItem',
      documentId,
      { status: dto.status },
    );

    return updated;
  }

  async addProceedingComment(
    proceedingId: number,
    dto: CreateDocumentCommentDto,
    user: CurrentUserData,
  ) {
    await this.ensureProceedingAccess(proceedingId, user);

    const comment = await this.documentHubDbService.documentComment.create({
      data: {
        proceedingId,
        authorAccountId: user.account.id,
        body: dto.body,
      },
      include: this.commentInclude(),
    });

    await this.recordActivity(
      proceedingId,
      user.account.id,
      DocumentActivityType.COMMENT_ADDED,
      'DocumentComment',
      comment.id,
    );

    return comment;
  }

  async addDocumentComment(
    documentId: number,
    dto: CreateDocumentCommentDto,
    user: CurrentUserData,
  ) {
    const document = await this.ensureDocumentAccess(documentId, user);

    const comment = await this.documentHubDbService.documentComment.create({
      data: {
        proceedingId: document.proceedingId,
        documentId,
        authorAccountId: user.account.id,
        body: dto.body,
      },
      include: this.commentInclude(),
    });

    await this.recordActivity(
      document.proceedingId,
      user.account.id,
      DocumentActivityType.COMMENT_ADDED,
      'DocumentComment',
      comment.id,
      { documentId },
    );

    return comment;
  }

  private async ensureProceedingAccess(id: number, user: CurrentUserData) {
    const proceeding = await this.documentHubDbService.documentProceeding.findFirst({
      where: { id, deletedAt: null },
    });

    if (!proceeding) {
      throw new NotFoundException('Document proceeding not found');
    }

    if (
      user.account.type !== AccountType.ADMIN &&
      proceeding.businessAccountId !== user.account.id &&
      proceeding.professionalAccountId !== user.account.id
    ) {
      throw new ForbiddenException('You do not have access to this proceeding');
    }

    return proceeding;
  }

  private async ensureDocumentAccess(
    documentId: number,
    user: CurrentUserData,
  ) {
    const document = await this.documentHubDbService.documentItem.findFirst({
      where: { id: documentId, deletedAt: null },
      include: { proceeding: true },
    });

    if (!document || document.proceeding.deletedAt) {
      throw new NotFoundException('Document not found');
    }

    if (
      user.account.type !== AccountType.ADMIN &&
      document.proceeding.businessAccountId !== user.account.id &&
      document.proceeding.professionalAccountId !== user.account.id
    ) {
      throw new ForbiddenException('You do not have access to this document');
    }

    return document;
  }

  private async recordActivity(
    proceedingId: number,
    actorAccountId: number,
    type: DocumentActivityType,
    entity: string,
    entityId?: number,
    details?: Prisma.InputJsonValue,
  ) {
    return this.documentHubDbService.documentActivity.create({
      data: {
        proceedingId,
        actorAccountId,
        type,
        entity,
        entityId,
        details,
      },
    });
  }

  private proceedingInclude(withDetails = true) {
    return {
      businessAccount: {
        select: { id: true, type: true, business: true },
      },
      professionalAccount: {
        select: {
          id: true,
          type: true,
          professional: true,
          users: { select: this.accountUserSelect() },
        },
      },
      createdByAccount: {
        select: { id: true, type: true },
      },
      documents: withDetails
        ? {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' as const },
            include: this.documentInclude(),
          }
        : {
            where: { deletedAt: null },
            select: { id: true, status: true },
          },
      comments: withDetails
        ? {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' as const },
            include: this.commentInclude(),
          }
        : false,
      activities: withDetails
        ? {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' as const },
          }
        : false,
    };
  }

  private documentInclude() {
    return {
      versions: {
        where: { deletedAt: null },
        orderBy: { versionNumber: 'desc' as const },
      },
      comments: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' as const },
        include: this.commentInclude(),
      },
      requestedByAccount: { select: { id: true, type: true } },
      uploadedByAccount: { select: { id: true, type: true } },
    };
  }

  private commentInclude() {
    return {
      authorAccount: {
        select: {
          id: true,
          type: true,
          users: { select: this.accountUserSelect() },
        },
      },
    };
  }

  private accountUserSelect() {
    return {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    };
  }
}
