import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AccountsService } from '@app/accounts/accounts.service';
import { AccountType } from '@prisma/client';
import { ApiFilterPagination } from '@app/core/decorators/api-filter-pagination.decorator';
import { PaginationInterceptor } from '@app/core/pagination/pagination.interceptor';
import { FiltersQuery, PaginationQuery } from '@app/core/decorators';
import { Accounts } from '@app/accounts/decorators/accounts.decorator';
import { CurrentUser } from '@app/iam/decorators';
import type { CurrentUserData } from '@app/iam/interfaces';

@Controller({ path: 'accounts', version: '1' })
@ApiTags('Accounts')
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Accounts(AccountType.ADMIN)
  @ApiQuery({
    name: 'type',
    type: 'string',
    required: true,
    enum: Object.keys(AccountType),
  })
  @ApiFilterPagination('Get all Accounts by account type')
  @UseInterceptors(PaginationInterceptor)
  @Get()
  async findAll(
    @FiltersQuery() filterOptions,
    @PaginationQuery() paginationOptions,
  ) {
    return await this.accountsService.findAll(filterOptions, paginationOptions);
  }

  @Accounts(AccountType.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  async create(@Body() createAccountDto: any) {
    return await this.accountsService.create(createAccountDto);
  }

  @Accounts(
    AccountType.ADMIN,
    AccountType.BUSINESS,
    AccountType.PROFESSIONAL,
  )
  @Get(':id')
  @ApiOperation({ summary: 'Get account details by ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return await this.accountsService.findOne(id, [], user);
  }

  @Accounts(
    AccountType.ADMIN,
    AccountType.BUSINESS,
    AccountType.PROFESSIONAL,
  )
  @Patch(':id')
  @ApiOperation({ summary: 'Update account details' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return await this.accountsService.update(id, updateAccountDto, user);
  }

  @Accounts(AccountType.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete (soft) an account' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.accountsService.delete(id);
  }
}
