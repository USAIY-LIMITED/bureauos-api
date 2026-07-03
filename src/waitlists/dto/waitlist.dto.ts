import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { WaitlistAccountType } from '@prisma/client';

export class CreateWaitlistDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  linkedinProfile?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ enum: WaitlistAccountType })
  @IsEnum(WaitlistAccountType)
  accountType: WaitlistAccountType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  founderStage?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  professionalCategory?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  rolePosition?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  expansionTarget?: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  biggestChallenge: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  challengeArea: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bosHelp?: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  subscribed_for_waitlist?: boolean;
}

