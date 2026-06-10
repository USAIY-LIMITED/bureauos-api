import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentItemStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDocumentItemDto {
  @ApiProperty({ example: 'Certificate of Incorporation' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Corporate Records' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: DocumentItemStatus })
  @IsOptional()
  @IsEnum(DocumentItemStatus)
  status?: DocumentItemStatus;

  @ApiPropertyOptional({ example: '2026-06-30T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
