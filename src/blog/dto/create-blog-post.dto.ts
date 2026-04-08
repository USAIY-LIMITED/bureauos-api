import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';

export enum BlogPostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateBlogPostDto {
  @ApiProperty({ description: 'Blog post title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Blog post HTML content from rich editor' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Short excerpt / summary' })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional({ description: 'Cover image URL (from upload endpoint)' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    type: [String],
    example: ['compliance', 'regulation'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Post status',
    enum: BlogPostStatus,
    default: BlogPostStatus.DRAFT,
  })
  @IsEnum(BlogPostStatus)
  @IsOptional()
  status?: BlogPostStatus;
}
