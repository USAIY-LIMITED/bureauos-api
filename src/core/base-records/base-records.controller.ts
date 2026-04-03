import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BaseRecordsService } from './base-records.service';
import { CreateBaseRecordDto, UpdateBaseRecordDto } from './dto/base-record.dto';
import { BaseRecordType } from '@prisma/client';

@ApiTags('Base Records')
@Controller('base-records')
export class BaseRecordsController {
  constructor(private readonly baseRecordsService: BaseRecordsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new base record' })
  create(@Body() createBaseRecordDto: CreateBaseRecordDto) {
    return this.baseRecordsService.create(createBaseRecordDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active base records, optionally filtered by type' })
  @ApiQuery({ name: 'type', enum: BaseRecordType, required: false })
  findAll(@Query('type') type?: BaseRecordType) {
    return this.baseRecordsService.findAll(type);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a base record by slug' })
  findOne(@Param('slug') slug: string) {
    return this.baseRecordsService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a base record' })
  update(@Param('id') id: string, @Body() updateBaseRecordDto: UpdateBaseRecordDto) {
    return this.baseRecordsService.update(+id, updateBaseRecordDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a base record' })
  remove(@Param('id') id: string) {
    return this.baseRecordsService.remove(+id);
  }
}
