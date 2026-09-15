import { Injectable, NotFoundException } from '@nestjs/common';
import { RegulatoryKbDbService } from './regulatory-kb.db.service';
import { CreateProcessProposalDto } from './dto/create-process-proposal.dto';
import {
  ProposalReviewDecision,
  ReviewProcessProposalDto,
} from './dto/review-process-proposal.dto';
import { RegulatoryKbQueryDto } from './dto/regulatory-kb-query.dto';
import { AuditLogsService } from '@app/core/audit-logs/audit-logs.service';
import { ProposalStatus } from '@prisma/client';

@Injectable()
export class RegulatoryKbService {
  constructor(
    private readonly kbDbService: RegulatoryKbDbService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * List regulatory processes, paginated + filterable by jurisdiction (public).
   */
  async findAll(filterOptions: any, paginationOptions: any) {
    const [data, totalCount] = await this.kbDbService.findAll(
      filterOptions,
      paginationOptions,
    );
    return { data, totalCount };
  }

  /**
   * Fetch a single process with its active version + ordered steps (public).
   */
  async findBySlug(slug: string) {
    const process = await this.kbDbService.regulatoryProcess.findFirst({
      where: { slug, deletedAt: null },
      include: {
        activeVersion: {
          include: {
            steps: { orderBy: { stepOrder: 'asc' } },
          },
        },
      },
    });

    if (!process) {
      throw new NotFoundException('Regulatory process not found');
    }

    return process;
  }

  /**
   * A verified Professional submits a correction proposal against a process.
   */
  async createProposal(dto: CreateProcessProposalDto, proposedByAccountId: number) {
    const process = await this.kbDbService.findById(dto.processId);
    if (!process) {
      throw new NotFoundException('Regulatory process not found');
    }

    const proposal = await this.kbDbService.prismaClient.processProposal.create({
      data: {
        processId: dto.processId,
        proposedByAccountId,
        proposedChanges: dto.proposedChanges as any,
        reasoning: dto.reasoning,
      },
    });

    this.auditLogsService
      .log({
        action: 'CREATED',
        entity: 'ProcessProposal',
        entityId: String(proposal.id),
        details: { processId: dto.processId, proposedByAccountId },
      })
      .catch(() => {});

    return proposal;
  }

  /**
   * Admin reviews a pending proposal. Approval bumps an immutable ProcessVersion
   * and re-points the process's activeVersionId; rejection just closes it out.
   */
  async reviewProposal(
    id: number,
    dto: ReviewProcessProposalDto,
    reviewedByAccountId: number,
  ) {
    const proposal = await this.kbDbService.prismaClient.processProposal.findFirst({
      where: { id, deletedAt: null },
    });

    if (!proposal) {
      throw new NotFoundException('Process proposal not found');
    }

    if (dto.status === ProposalReviewDecision.REJECTED) {
      return this.kbDbService.prismaClient.processProposal.update({
        where: { id },
        data: {
          status: ProposalStatus.REJECTED,
          reviewNotes: dto.reviewNotes,
          reviewedByAccountId,
        },
      });
    }

    const { steps, versionNumber, changelog } = proposal.proposedChanges as any;

    return this.kbDbService.prismaClient.$transaction(async (tx) => {
      await tx.processVersion.updateMany({
        where: { processId: proposal.processId },
        data: { isCurrent: false },
      });

      const version = await tx.processVersion.create({
        data: {
          processId: proposal.processId,
          versionNumber,
          changelog,
          publishedByAccountId: reviewedByAccountId,
          isCurrent: true,
          steps: {
            create: (steps || []).map((step: any) => ({
              stepOrder: step.stepOrder,
              title: step.title,
              description: step.description,
              estimatedDays: step.estimatedDays,
              statutoryFeeNaira: step.statutoryFeeNaira,
              statutoryFeeUsd: step.statutoryFeeUsd,
              requiredDocs: step.requiredDocs || [],
            })),
          },
        },
      });

      await tx.regulatoryProcess.update({
        where: { id: proposal.processId },
        data: { activeVersionId: version.id },
      });

      const updatedProposal = await tx.processProposal.update({
        where: { id },
        data: {
          status: ProposalStatus.MERGED,
          reviewNotes: dto.reviewNotes,
          reviewedByAccountId,
        },
      });

      this.auditLogsService
        .log({
          action: 'UPDATED',
          entity: 'RegulatoryProcess',
          entityId: String(proposal.processId),
          details: { newVersionId: version.id, versionNumber },
        })
        .catch(() => {});

      return updatedProposal;
    });
  }
}
