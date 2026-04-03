import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { AccountType } from '@prisma/client';
import { CreateAccountDto } from '@app/accounts/dto/create-account.dto';
import { Transform } from 'class-transformer';

export class CreateBusinessOwnerDto extends PickType(CreateAccountDto, [
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
    default: null,
  })
  companyName: string;
  @ApiProperty({
    type: String,
    default: null,
  })
  userName: string;

  @ApiProperty({
    type: String,
    default: null,
  })
  bio: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    type: Number,
  })
  @IsNotEmpty()
  @IsOptional()
  affiliateOfId: number;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsOptional()
  customer_code: string;

  @ApiProperty({
    type: Boolean,
  })
  @IsNotEmpty()
  @IsOptional()
  isVerified: boolean;

  @ApiProperty({
    type: Boolean,
  })
  @IsNotEmpty()
  @IsOptional()
  isUserNameSet: boolean;
}
