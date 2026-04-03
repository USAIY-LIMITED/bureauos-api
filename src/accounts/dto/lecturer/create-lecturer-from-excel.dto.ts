import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AccountType, SchoolType, Sex } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateLecturerFromExcelDto {
  @ApiProperty({
    enum: AccountType,
  })
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;
  accountType: AccountType;

  @ApiProperty({
    type: String,
    description: 'Lecturer Type [SECONDARY, TERTIARY]',
  })
  @IsNotEmpty()
  @IsString()
  lecturerType: SchoolType;

  @ApiProperty({
    type: String,
    description: 'First Name',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    type: String,
    description: 'Last Name',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    type: String,
    description: 'Lecturer position',
  })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({
    type: String,
    description: 'Employee Type',
    example: 'Principal',
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  employeeType: string;

  @ApiProperty({
    type: Date,
    description: 'Lecturer Date O Birth',
  })
  @IsNotEmpty()
  dateOfBirth: Date;

  @ApiProperty({
    type: String,
    description: 'Lecturer State Of Origin',
  })
  @IsString()
  @IsNotEmpty()
  stateOfOrigin: string;

  @ApiProperty({
    type: String,
    description: 'Lecturer LGA',
  })
  @IsString()
  @IsNotEmpty()
  localGovernment: string;

  @ApiProperty({
    type: String,
    description: 'Lecturer Gender',
  })
  @IsString()
  @IsNotEmpty()
  sex: Sex;

  @ApiProperty({
    type: String,
    description: 'Lecturer Phone Number',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    type: Number,
    description: 'Lecturer School Id',
  })
  @IsNumber()
  schoolId: number;

  @ApiProperty({
    type: Number,
    description: 'Lecturer Faculty Id',
  })
  @IsNumber()
  @IsOptional()
  facultyId?: number;

  @ApiProperty({
    type: Number,
    description: 'Lecturer Department Id',
  })
  @IsNumber()
  @IsOptional()
  departmentId?: number;

  @ApiProperty({
    type: String,
    description: 'Lecturer Bio',
  })
  @IsString()
  @IsOptional()
  bio?: string;
}
