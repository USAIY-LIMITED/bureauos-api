import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogQueryDto } from './dto/blog-query.dto';
import { Public } from '@app/iam/decorators/public.decorator';
import { Accounts } from '@app/accounts/decorators/accounts.decorator';
import { CurrentUser } from '@app/iam/decorators/current-user.decorators';
import type { CurrentUserData } from '@app/iam/interfaces';
import { UploadService } from '@app/core/upload/upload.service';

@ApiTags('Blog')
@Controller({ path: 'blog', version: '1' })
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly uploadService: UploadService,
  ) {}

  // ─── Public Endpoints ───────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published blog posts (public)' })
  findAllPublished(@Query() query: BlogQueryDto) {
    return this.blogService.findAllPublished(query);
  }

  @Public()
  @Get('tags')
  @ApiOperation({ summary: 'Get all unique tags from published posts' })
  findAllTags() {
    return this.blogService.findAllTags();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a published blog post by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  // ─── Admin Endpoints ────────────────────────────────────────────

  @Accounts('ADMIN')
  @Get('admin/all')
  @ApiOperation({ summary: 'List all blog posts — any status (admin)' })
  findAllAdmin(@Query() query: BlogQueryDto) {
    return this.blogService.findAllAdmin(query);
  }

  @Accounts('ADMIN')
  @Get('admin/:id')
  @ApiOperation({ summary: 'Get a single blog post by ID (admin)' })
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.findOneAdmin(id);
  }

  @Accounts('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a new blog post (admin)' })
  create(
    @Body() dto: CreateBlogPostDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.blogService.create(dto, user.account.id);
  }

  @Accounts('ADMIN')
  @Post('upload-cover')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a cover image for a blog post (admin)' })
  async uploadCover(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file, 'blog/covers');
  }

  @Accounts('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a blog post (admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBlogPostDto,
  ) {
    return this.blogService.update(id, dto);
  }

  @Accounts('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a blog post (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.remove(id);
  }
}
