import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';
import { IsOptional } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    enum: AccountType,
    required: true,
  })
  accountType: AccountType;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  passport?: string;
}
