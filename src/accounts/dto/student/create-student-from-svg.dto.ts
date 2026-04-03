import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Level, SchoolType, Sex } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateStudentFromExcelDto {
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
  @IsString()
  @IsOptional()
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
    type: Date,
  })
  @IsString()
  @IsOptional()
  dateOfBirth: Date;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Student Class',
  })
  @IsNumber()
  @IsOptional()
  classId?: number;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Student Faculty',
  })
  @IsNumber()
  @IsOptional()
  facultyId?: number;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Student Department',
  })
  @IsNumber()
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
}
