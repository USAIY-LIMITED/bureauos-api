import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class SendMailOnSandboxDto {
  @ApiProperty({
    type: String,
    description: 'Reciver Email',
  })
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @ApiProperty({
    type: String,
    description: 'Email Subject',
  })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({
    type: String,
    description: 'Email Body',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    type: String,
    description: 'Carbon Copy Emails (comma-separated)',
  })
  @IsOptional()
  @IsString()
  cc?: string;

  @ApiProperty({
    type: String,
    description: 'Blind Carbon Copy Emails (comma-separated)',
  })
  @IsOptional()
  @IsString()
  bcc?: string;
}
