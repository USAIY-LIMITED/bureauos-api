import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ProposalReviewDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ReviewProcessProposalDto {
  @ApiProperty({ description: 'Review decision', enum: ProposalReviewDecision })
  @IsEnum(ProposalReviewDecision)
  status: ProposalReviewDecision;

  @ApiPropertyOptional({ description: 'Optional reviewer notes' })
  @IsString()
  @IsOptional()
  reviewNotes?: string;
}
