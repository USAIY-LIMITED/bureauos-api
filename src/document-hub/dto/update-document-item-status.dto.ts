import { ApiProperty } from '@nestjs/swagger';
import { DocumentItemStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateDocumentItemStatusDto {
  @ApiProperty({ enum: DocumentItemStatus })
  @IsEnum(DocumentItemStatus)
  status: DocumentItemStatus;
}
