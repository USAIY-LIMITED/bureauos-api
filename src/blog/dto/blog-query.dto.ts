import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString, IsEnum } from 'class-validator';
import { BlogPostStatus } from './create-blog-post.dto';

export class BlogQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: '1' })
  @IsNumberString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', default: '10' })
  @IsNumberString()
  @IsOptional()
  limit?: string;

  @ApiPropertyOptional({ description: 'Filter by tag' })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiPropertyOptional({ description: 'Search in title and excerpt' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by status (admin only)',
    enum: BlogPostStatus,
  })
  @IsEnum(BlogPostStatus)
  @IsOptional()
  status?: BlogPostStatus;
}
