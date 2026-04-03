import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateEmailTemplateDto {
  @ApiProperty({
    type: String,
    description: 'Email Subject',
    required: true,
  })
  @IsString()
  subject: string;

  @ApiProperty({
    type: String,
    description: 'Email Title',
    required: true,
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString({ message: 'Invalid character' })
  body: string;
}
