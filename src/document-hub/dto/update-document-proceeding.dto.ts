import { ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentProceedingStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateDocumentProceedingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: DocumentProceedingStatus })
  @IsOptional()
  @IsEnum(DocumentProceedingStatus)
  status?: DocumentProceedingStatus;

  @ApiPropertyOptional({ example: '2026-06-30T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
