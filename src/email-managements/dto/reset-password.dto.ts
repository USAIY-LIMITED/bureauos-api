import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class SendResetPassDto {
  @ApiProperty({
    type: String,
    description: 'Reciver Email',
  })
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @ApiProperty({
    type: String,
    description: 'Password',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    type: String,
    description: 'firstName',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    type: String,
    description: 'lastName',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

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
