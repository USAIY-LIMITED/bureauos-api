import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    type: String,
    example: 'super-admin@admin.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiProperty({
    type: String,
    example: 'password',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    type: Boolean,
    description: 'Indicates if the user is logging in via VirtuoPay',
    default: false,
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isVirtuoPay?: boolean;
}
