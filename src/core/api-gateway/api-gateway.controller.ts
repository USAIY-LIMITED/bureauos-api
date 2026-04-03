import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('BureauOS - Api Gateway')
@Controller('api-gateway')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Post()
  @ApiOperation({ summary: 'Create API Gateway Key' })
  async create(@Body() apiGatewayDto: any) {
    return await this.apiGatewayService.create(apiGatewayDto);
  }

  @Get()
  @ApiOperation({ summary: 'Find all API Gateway Keys' })
  async findAll(@Query() filterOptions: any, @Query() paginationOptions: any) {
    return await this.apiGatewayService.findAll(filterOptions, paginationOptions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one API Gateway Key' })
  async findOne(@Param('id') id: string) {
    return await this.apiGatewayService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update API Gateway Key' })
  async update(@Param('id') id: string, @Body() data: any) {
    return await this.apiGatewayService.update(+id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete API Gateway Key' })
  async remove(@Param('id') id: string) {
    return await this.apiGatewayService.delete(+id);
  }
}
