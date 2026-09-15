import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateProcessProposalDto {
  @ApiProperty({ description: 'ID of the RegulatoryProcess being corrected' })
  @IsInt()
  processId: number;

  @ApiProperty({
    description: 'Full proposed step modifications (title, description, estimatedDays, fees, requiredDocs per step)',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  proposedChanges: Record<string, unknown>;

  @ApiProperty({ description: 'Why this correction is needed, e.g. "CAC updated filing fee from ₦10,000 to ₦15,000 on Sep 1"' })
  @IsString()
  @IsNotEmpty()
  reasoning: string;
}
