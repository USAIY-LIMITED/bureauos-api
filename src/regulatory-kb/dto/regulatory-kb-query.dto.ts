import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { JurisdictionCode } from '@prisma/client';

export class RegulatoryKbQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: '1' })
  @IsNumberString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', default: '10' })
  @IsNumberString()
  @IsOptional()
  limit?: string;

  @ApiPropertyOptional({ description: 'Filter by jurisdiction', enum: JurisdictionCode })
  @IsEnum(JurisdictionCode)
  @IsOptional()
  jurisdiction?: JurisdictionCode;

  @ApiPropertyOptional({ description: 'Search in title and slug' })
  @IsString()
  @IsOptional()
  search?: string;
}
