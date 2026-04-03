import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    type: String,
    description: 'Token to reset password',
    example: 'ggvhbjsnks-njxjbjdbjb',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    type: String,
    description: 'New password to set',
    example: '123456778abc',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  newPassword: string;
}
