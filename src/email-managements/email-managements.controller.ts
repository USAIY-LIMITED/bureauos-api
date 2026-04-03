import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmailManagementsService } from './email-managements.service';
import { AccountType } from '@prisma/client';
import { Accounts } from '@app/accounts/decorators/accounts.decorator';

@Controller('email-managements')
@ApiTags('Email Templates')
@ApiBearerAuth()
export class EmailManagementsController {
  constructor(private readonly emailService: EmailManagementsService) {}

  @Accounts(AccountType.ADMIN)
  @Post('templates')
  @ApiOperation({ summary: 'Create a new email template' })
  async create(@Body() createTemplateDto: any) {
    return await this.emailService.createTemplate(createTemplateDto);
  }

  @Accounts(AccountType.ADMIN)
  @Get('templates')
  @ApiOperation({ summary: 'List all email templates' })
  async findAll() {
    return await this.emailService.findAllTemplates();
  }

  @Accounts(AccountType.ADMIN)
  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template details by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.emailService.findOneTemplate(id);
  }

  @Accounts(AccountType.ADMIN)
  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update template content' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTemplateDto: any,
  ) {
    return await this.emailService.updateTemplate(id, updateTemplateDto);
  }

  @Accounts(AccountType.ADMIN)
  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete (soft) a template' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.emailService.removeTemplate(id);
  }
}
