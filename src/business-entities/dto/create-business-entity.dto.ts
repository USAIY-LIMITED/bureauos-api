import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EntityStatusTrack } from '@prisma/client';

export class CreateBusinessEntityDto {
  @ApiProperty({ description: 'Business account this entity belongs to (auto-injected for non-admin callers)' })
  @IsInt()
  @IsOptional()
  accountId?: number;

  @ApiProperty({ description: 'Entity / company name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Onboarding track', enum: EntityStatusTrack })
  @IsEnum(EntityStatusTrack)
  statusTrack: EntityStatusTrack;

  // ─── Existing Company fields ────────────────────────────────────

  @ApiPropertyOptional({ description: 'CAC Registration / RC Number' })
  @IsString()
  @IsOptional()
  rcNumber?: string;

  @ApiPropertyOptional({ description: 'Tax Identification Number' })
  @IsString()
  @IsOptional()
  tinNumber?: string;

  @ApiPropertyOptional({ description: 'Incorporation date' })
  @IsDateString()
  @IsOptional()
  incorporationDate?: string;

  // ─── Dream Company fields ───────────────────────────────────────

  @ApiPropertyOptional({ description: 'Up to 3 preferred company names for CAC availability check', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  proposedNames?: string[];

  @ApiPropertyOptional({ description: 'Planned expansion / registration jurisdictions', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetJurisdictions?: string[];

  @ApiPropertyOptional({ description: 'Initial share capital amount' })
  @IsNumber()
  @IsOptional()
  shareCapital?: number;

  @ApiPropertyOptional({ description: 'Primary business activity / industry sector' })
  @IsString()
  @IsOptional()
  industrySector?: string;
}
