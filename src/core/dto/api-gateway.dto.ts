import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ApiGatewayDto {
  @ApiProperty({
    type: String,
    description: 'Api Gateway Key',
    example: '123456',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    type: String,
    description: 'Api Gateway Slug',
    example: 'slug',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    type: String,
    description: 'Api Gateway Name',
    example: 'Name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: Number,
    description: 'Account that owns this API Gateway key',
    example: 1,
    required: true,
  })
  @IsInt()
  @Min(1)
  accountId: number;

  @ApiProperty({
    type: Number,
    description: 'Allowed requests per minute',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  rateLimit?: number;

  @ApiProperty({
    type: Number,
    description: 'Burst request allowance',
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  burstLimit?: number;

  @ApiProperty({
    type: Boolean,
    description: 'Whether this access point is enabled',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({
    type: Object,
    description: 'Additional API access-point configuration',
    required: false,
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
