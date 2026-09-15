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
import { BusinessEntitiesService } from './business-entities.service';
import { CreateBusinessEntityDto, UpdateBusinessEntityDto } from './dto';
import { Accounts } from '@app/accounts/decorators/accounts.decorator';
import { CurrentUser } from '@app/iam/decorators/current-user.decorators';
import type { CurrentUserData } from '@app/iam/interfaces/current-user.interface';
import { ApiFilterPagination } from '@app/core/decorators/api-filter-pagination.decorator';
import { PaginationInterceptor } from '@app/core/pagination/pagination.interceptor';
import { FiltersQuery, PaginationQuery } from '@app/core/decorators';

@ApiTags('Business Entities')
@ApiBearerAuth()
@Controller({ path: 'business-entities', version: '1' })
export class BusinessEntitiesController {
  constructor(private readonly entitiesService: BusinessEntitiesService) {}

  @Accounts(AccountType.BUSINESS)
  @Post()
  @ApiOperation({ summary: 'Start onboarding a company (Existing or Dream track)' })
  create(
    @Body() dto: CreateBusinessEntityDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.entitiesService.create(dto, user.account.id);
  }

  @Accounts(AccountType.BUSINESS)
  @ApiFilterPagination("List the caller's own business entities")
  @UseInterceptors(PaginationInterceptor)
  @Get()
  findAll(
    @FiltersQuery() filterOptions,
    @PaginationQuery() paginationOptions,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.entitiesService.findAll(
      { ...filterOptions, businessAccountId: user.account.id },
      paginationOptions,
    );
  }

  @Accounts(AccountType.BUSINESS)
  @Get(':id')
  @ApiOperation({ summary: 'Get a single business entity by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.entitiesService.findOne(id);
  }

  @Accounts(AccountType.BUSINESS)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a business entity' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBusinessEntityDto,
  ) {
    return this.entitiesService.update(id, dto);
  }
}
