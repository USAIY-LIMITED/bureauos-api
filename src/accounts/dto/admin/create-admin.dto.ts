import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { AccountType } from '@prisma/client';
import { CreateAccountDto } from '@app/accounts/dto/create-account.dto';
import { Transform } from 'class-transformer';

export class CreateAdminDto extends PickType(CreateAccountDto, [
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
}
