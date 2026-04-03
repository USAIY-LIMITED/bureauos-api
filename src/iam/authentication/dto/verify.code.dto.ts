import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  code?: string;
}
