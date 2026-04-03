import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AccountType, SchoolType } from '@prisma/client';
import { CreateAccountDto } from '@app/accounts/dto/create-account.dto';
import { Transform } from 'class-transformer';

export class CreateSchoolDto extends PickType(CreateAccountDto, [
  'accountType',
]) {
  @ApiProperty({
    enum: AccountType,
  })
  accountType: AccountType;

  @ApiProperty({
    enum: SchoolType,
    description: 'School Type (SECONDARY or TERTIARY)',
  })
  @IsNotEmpty()
  schoolType: string;

  @ApiProperty({
    type: String,
    description: 'School Email',
  })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    type: String,
    description: 'School Name',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Registration code',
  })
  @IsNotEmpty()
  regCode: string;

  @ApiProperty({
    type: String,
    description: 'School Address',
  })
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    type: String,
    description: 'School State',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    type: Number,
    description: 'School State',
  })
  @IsNumber()
  @IsNotEmpty()
  yearOfEstablishment: number;

  @ApiProperty({
    type: String,
    description: 'School PHone Number',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    type: String,
    description: 'School Owner First Name',
  })
  @IsString()
  @IsOptional()
  ownerFirstName?: string;

  @ApiProperty({
    type: String,
    description: 'School Owner Last Name',
  })
  @IsString()
  @IsOptional()
  ownerLastName?: string;

  @ApiProperty({
    type: String,
    description: 'School Bio',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    type: String,
    description: 'School Logo',
  })
  @IsOptional()
  logo?: string;
}
