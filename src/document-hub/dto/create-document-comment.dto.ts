import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentCommentDto {
  @ApiProperty({ example: 'Please upload the signed copy.' })
  @IsString()
  @IsNotEmpty()
  body: string;
}
