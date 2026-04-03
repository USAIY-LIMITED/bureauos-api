import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { AccountType, Sex } from '@prisma/client';
import { CreateAccountDto } from '@app/accounts/dto/create-account.dto';
import { Transform } from 'class-transformer';

export class CreateLecturerDto extends PickType(CreateAccountDto, [
  'accountType',
]) {
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

  @ApiProperty({
    type: String,
    description: 'Lecturer Type',
  })
  @IsString()
  @IsOptional()
  lecturerType?: string;
}
