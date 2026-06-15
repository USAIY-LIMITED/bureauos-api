import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';
import { Accounts } from '@app/accounts/decorators/accounts.decorator';
import { ApiGatewayDto } from '@app/core/dto/api-gateway.dto';
import { UpdateApiGatewayDto } from '@app/core/dto/update-api-gateway.dto';

@ApiTags('BureauOS - Api Gateway')
@ApiBearerAuth()
@Accounts(AccountType.ADMIN)
@Controller({ path: 'api-gateway', version: '1' })
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Post()
  @ApiOperation({ summary: 'Create API Gateway Key' })
  async create(@Body() apiGatewayDto: ApiGatewayDto) {
    return await this.apiGatewayService.create(apiGatewayDto);
  }

  @Get()
  @ApiOperation({ summary: 'Find all API Gateway Keys' })
  async findAll(@Query() filterOptions: any, @Query() paginationOptions: any) {
    return await this.apiGatewayService.findAll(filterOptions, paginationOptions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one API Gateway Key' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.apiGatewayService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update API Gateway Key' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateApiGatewayDto,
  ) {
    return await this.apiGatewayService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete API Gateway Key' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.apiGatewayService.delete(id);
  }
}
