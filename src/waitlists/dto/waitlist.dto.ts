import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreateWaitlistDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  userType: AccountType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  linkedinProfile?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  jurisdiction?: string;

  @ApiProperty({ required: false, isArray: true, type: String })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specializations?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  yearsExperience?: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  subscribed_for_waitlist?: boolean;
}
