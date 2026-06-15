import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AccountType } from '@prisma/client';
import { Accounts } from '@app/accounts/decorators/accounts.decorator';
import { CurrentUser } from '@app/iam/decorators/current-user.decorators';
import type { CurrentUserData } from '@app/iam/interfaces';
import { DocumentHubService } from './document-hub.service';
import {
  CreateDocumentCommentDto,
  CreateDocumentItemDto,
  CreateDocumentProceedingDto,
  DocumentHubQueryDto,
  UpdateDocumentItemStatusDto,
  UpdateDocumentProceedingDto,
} from './dto';

@ApiTags('Document Hub')
@ApiBearerAuth()
@Controller({ path: 'document-hub', version: '1' })
export class DocumentHubController {
  constructor(private readonly documentHubService: DocumentHubService) {}

  @Accounts(AccountType.BUSINESS)
  @Post('proceedings')
  @ApiOperation({
    summary: 'Create a document proceeding with a professional',
  })
  createProceeding(
    @Body() dto: CreateDocumentProceedingDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.documentHubService.createProceeding(dto, user);
  }

  @Accounts(AccountType.BUSINESS, AccountType.PROFESSIONAL, AccountType.ADMIN)
  @Get('proceedings')
  @ApiOperation({ summary: 'List accessible document proceedings' })
  findAll(
    @Query() query: DocumentHubQueryDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.documentHubService.findAll(query, user);
  }

  @Accounts(AccountType.BUSINESS, AccountType.PROFESSIONAL, AccountType.ADMIN)
  @Get('proceedings/:id')
  @ApiOperation({ summary: 'Get a document proceeding with documents' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.documentHubService.findOne(id, user);
  }

  @Accounts(AccountType.BUSINESS, AccountType.PROFESSIONAL, AccountType.ADMIN)
  @Patch('proceedings/:id')
  @ApiOperation({ summary: 'Update a document proceeding' })
  updateProceeding(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDocumentProceedingDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.documentHubService.updateProceeding(id, dto, user);
  }

  @Accounts(AccountType.BUSINESS, AccountType.PROFESSIONAL, AccountType.ADMIN)
  @Post('proceedings/:id/documents')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        status: { type: 'string' },
        dueAt: { type: 'string', format: 'date-time' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['title'],
    },
  })
  @ApiOperation({ summary: 'Create a document request or upload' })
  createDocument(
    @Param('id', ParseIntPipe) proceedingId: number,
    @Body() dto: CreateDocumentItemDto,
    @CurrentUser() user: CurrentUserData,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.documentHubService.createDocument(
      proceedingId,
      dto,
      user,
      file,
    );
  }

  @Accounts(AccountType.BUSINESS, AccountType.PROFESSIONAL, AccountType.ADMIN)
  @Post('documents/:id/versions')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiOperation({ summary: 'Upload a new version for a document' })
  uploadVersion(
    @Param('id', ParseIntPipe) documentId: number,
    @CurrentUser() user: CurrentUserData,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentHubService.uploadVersion(documentId, user, file);
  }

  @Accounts(AccountType.BUSINESS, AccountType.PROFESSIONAL, AccountType.ADMIN)
  @Patch('documents/:id/status')
  @ApiOperation({ summary: 'Update document review status' })
  updateDocumentStatus(
    @Param('id', ParseIntPipe) documentId: number,
    @Body() dto: UpdateDocumentItemStatusDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.documentHubService.updateDocumentStatus(documentId, dto, user);
  }

  @Accounts(AccountType.BUSINESS, AccountType.PROFESSIONAL, AccountType.ADMIN)
  @Post('proceedings/:id/comments')
  @ApiOperation({ summary: 'Comment on a proceeding' })
  addProceedingComment(
    @Param('id', ParseIntPipe) proceedingId: number,
    @Body() dto: CreateDocumentCommentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.documentHubService.addProceedingComment(
      proceedingId,
      dto,
      user,
    );
  }

  @Accounts(AccountType.BUSINESS, AccountType.PROFESSIONAL, AccountType.ADMIN)
  @Post('documents/:id/comments')
  @ApiOperation({ summary: 'Comment on a document' })
  addDocumentComment(
    @Param('id', ParseIntPipe) documentId: number,
    @Body() dto: CreateDocumentCommentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.documentHubService.addDocumentComment(documentId, dto, user);
  }
}
