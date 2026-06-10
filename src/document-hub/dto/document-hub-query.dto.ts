import { ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentProceedingStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class DocumentHubQueryDto {
  @ApiPropertyOptional({ enum: DocumentProceedingStatus })
  @IsOptional()
  @IsEnum(DocumentProceedingStatus)
  status?: DocumentProceedingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsString()
  limit?: string;
}
