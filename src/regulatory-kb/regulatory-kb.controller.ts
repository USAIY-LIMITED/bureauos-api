import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';
import { RegulatoryKbService } from './regulatory-kb.service';
import { CreateProcessProposalDto, ReviewProcessProposalDto } from './dto';
import { Public } from '@app/iam/decorators/public.decorator';
import { Accounts } from '@app/accounts/decorators/accounts.decorator';
import { CurrentUser } from '@app/iam/decorators/current-user.decorators';
import type { CurrentUserData } from '@app/iam/interfaces/current-user.interface';
import { ApiFilterPagination } from '@app/core/decorators/api-filter-pagination.decorator';
import { PaginationInterceptor } from '@app/core/pagination/pagination.interceptor';
import { FiltersQuery, PaginationQuery } from '@app/core/decorators';

@ApiTags('Regulatory KB')
@Controller({ path: 'kb', version: '1' })
export class RegulatoryKbController {
  constructor(private readonly kbService: RegulatoryKbService) {}

  // ─── Public Endpoints ───────────────────────────────────────────

  @Public()
  @ApiFilterPagination('List versioned regulatory processes by jurisdiction (public)')
  @UseInterceptors(PaginationInterceptor)
  @Get('processes')
  findAll(
    @FiltersQuery() filterOptions,
    @PaginationQuery() paginationOptions,
  ) {
    return this.kbService.findAll(filterOptions, paginationOptions);
  }

  @Public()
  @Get('processes/:slug')
  @ApiOperation({ summary: 'Get a process\'s active version, steps and fees by slug (public)' })
  findBySlug(@Param('slug') slug: string) {
    return this.kbService.findBySlug(slug);
  }

  // ─── Professional Endpoints ─────────────────────────────────────

  @ApiBearerAuth()
  @Accounts(AccountType.PROFESSIONAL)
  @Post('proposals')
  @ApiOperation({ summary: 'Submit a correction proposal against a process (verified professionals)' })
  createProposal(
    @Body() dto: CreateProcessProposalDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.kbService.createProposal(dto, user.account.id);
  }

  // ─── Admin Endpoints ────────────────────────────────────────────

  @ApiBearerAuth()
  @Accounts(AccountType.ADMIN)
  @Patch('proposals/:id/review')
  @ApiOperation({ summary: 'Approve or reject a proposal; approval bumps an immutable version (admin)' })
  reviewProposal(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewProcessProposalDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.kbService.reviewProposal(id, dto, user.account.id);
  }
}
