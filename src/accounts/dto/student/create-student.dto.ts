import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AccountType, Level, SchoolType, Sex } from '@prisma/client';
import { CreateAccountDto } from '@app/accounts/dto/create-account.dto';
import { Transform } from 'class-transformer';

export class CreateStudentDto extends PickType(CreateAccountDto, [
  'accountType',
]) {
  @ApiProperty({
    enum: AccountType,
  })
  accountType: AccountType;
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    type: String,
    description: 'Student Type (TERTIARY or SECONDARY)',
  })
  @IsNotEmpty()
  @IsString()
  studentType: SchoolType;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  localGovernment: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  stateOfOrigin: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    enum: Sex,
  })
  @IsNotEmpty()
  sex: Sex;

  @ApiProperty({
    enum: Level,
  })
  @IsNotEmpty()
  level: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Student Faculty',
  })
  @IsNumber()
  @IsOptional()
  facultyId?: number;

  @ApiProperty({
    type: String,
    description: 'Student Department',
  })
  @IsString()
  @IsOptional()
  departmentName?: string;

  @ApiProperty({
    type: Number,
    description: 'Student Department',
  })
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  departmentId?: number;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Student School',
  })
  @IsNotEmpty()
  @IsNumber()
  schoolId: number;

  @ApiProperty({
    type: String,
    required: true,
    description: 'Matric Number',
  })
  @IsNotEmpty()
  matricNumber: string;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Student Year of Admission',
  })
  @IsNotEmpty()
  @IsNumber()
  yearOfAdmission: number;

  @ApiProperty({
    type: String,
    required: true,
    description: '',
  })
  @IsString()
  @IsOptional()
  guardianFullName?: string;

  @ApiProperty({
    type: String,
    description: 'Student Bio',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: '',
  })
  @IsString()
  @IsOptional()
  xUrl?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: '',
  })
  @IsString()
  @IsOptional()
  linkedinUrl?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: '',
  })
  @IsString()
  @IsOptional()
  facebookUrl?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: '',
  })
  @IsString()
  @IsOptional()
  instagramUrl?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  passport: string;
}
