import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { BaseRecordType } from '@prisma/client';

export class CreateBaseRecordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ enum: BaseRecordType })
  @IsEnum(BaseRecordType)
  type: BaseRecordType;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: any;
}

export class UpdateBaseRecordDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: BaseRecordType, required: false })
  @IsEnum(BaseRecordType)
  @IsOptional()
  type?: BaseRecordType;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: any;
}
