import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ApiGatewayDto {
  @ApiProperty({
    type: String,
    description: 'Api Gateway Key',
    example: '123456',
    required: true,
  })
  @IsString()
  key: string;

  @ApiProperty({
    type: String,
    description: 'Api Gateway Slug',
    example: 'slug',
    required: true,
  })
  @IsString()
  slug: string;

  @ApiProperty({
    type: String,
    description: 'Api Gateway Name',
    example: 'Name',
  })
  @IsString()
  name: string;
}
