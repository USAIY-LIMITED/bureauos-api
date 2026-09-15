import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';
import { Accounts } from '@app/accounts/decorators/accounts.decorator';
import { CurrentUser } from '@app/iam/decorators';
import type { CurrentUserData } from '@app/iam/interfaces';
import { ApiFilterPagination } from '@app/core/decorators/api-filter-pagination.decorator';
import { PaginationInterceptor } from '@app/core/pagination/pagination.interceptor';
import { PaginationQuery } from '@app/core/decorators';
import { BadgesService } from './badges.service';

@ApiTags('Badges')
@ApiBearerAuth()
@Controller({ path: 'badges', version: '1' })
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get('accounts/:accountId')
  @Accounts(AccountType.ADMIN)
  @ApiOperation({ summary: "Get an account's held badges (admin lookup)" })
  findForAccount(@Param('accountId', ParseIntPipe) accountId: number) {
    return this.badgesService.findForAccount(accountId);
  }

  @Get('me')
  @Accounts(AccountType.BUSINESS, AccountType.PROFESSIONAL)
  @ApiOperation({ summary: "Get the current account's held badges" })
  findMine(@CurrentUser() user: CurrentUserData) {
    return this.badgesService.findForAccount(user.account.id);
  }

  @Get(':slug/holders')
  @Accounts(AccountType.ADMIN)
  @ApiFilterPagination('List every account that currently holds a badge')
  @UseInterceptors(PaginationInterceptor)
  findHolders(
    @Param('slug') slug: string,
    @PaginationQuery() paginationOptions,
  ) {
    return this.badgesService.findHoldersOfBadge(slug, paginationOptions);
  }

  @Post('accounts/:accountId/:slug')
  @Accounts(AccountType.ADMIN)
  @ApiOperation({
    summary: 'Manually issue a badge to an account (admin override)',
  })
  issue(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('slug') slug: string,
  ) {
    return this.badgesService.issueBadge(accountId, slug);
  }

  @Delete('accounts/:accountId/:slug')
  @Accounts(AccountType.ADMIN)
  @ApiOperation({ summary: 'Revoke a badge from an account (admin override)' })
  revoke(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('slug') slug: string,
  ) {
    return this.badgesService.revokeBadge(accountId, slug);
  }
}
