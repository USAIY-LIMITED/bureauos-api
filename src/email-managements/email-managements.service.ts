import { Injectable, NotFoundException } from '@nestjs/common';
import { EmailManagementDbService } from './email-management.db.service';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailManagementsService {
  private transporter;
  private templateLoader;

  constructor(
    private readonly emailManagementDbService: EmailManagementDbService,
    private readonly configService: ConfigService,
  ) {
    const mailConfigValues = this.configService.get('mail');
    this.transporter = nodemailer.createTransport({
      host: mailConfigValues.host,
      port: mailConfigValues.port,
      secure: mailConfigValues.secure,
      auth: {
        user: mailConfigValues.user,
        pass: mailConfigValues.pass,
      },
    });

    const templatePath = path.join(
      process.cwd(),
      'src/email-managements/templates/layout.hbs',
    );
    const source = fs.readFileSync(templatePath, 'utf8');
    this.templateLoader = handlebars.compile(source);
  }

  async sendMail(to: string, slug: string, data: any) {
    const template = await this.emailManagementDbService.findBySlug(slug);

    if (!template) {
      throw new NotFoundException(`Email template with slug "${slug}" not found`);
    }

    // Compile the DB body if it contains handlebars variables
    const bodyTemplate = handlebars.compile(template.body);
    const bodyContent = bodyTemplate(data);

    // Wrap in global layout
    const html = this.templateLoader({
      title: template.subject,
      content: bodyContent,
      ...data,
    });

    const mailConfigValues = this.configService.get('mail');
    const mailOptions = {
      from: mailConfigValues.from,
      to,
      subject: template.subject,
      html,
    };

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // CRUD for Email Templates (used by controller)
  async createTemplate(data: any) {
    return this.emailManagementDbService.create(data);
  }

  async findAllTemplates() {
    const [data] = await this.emailManagementDbService.findAll();
    return data;
  }

  async findOneTemplate(id: number) {
    return this.emailManagementDbService.findById(id);
  }

  async updateTemplate(id: number, data: any) {
    return this.emailManagementDbService.update(id, data);
  }

  async removeTemplate(id: number) {
    return this.emailManagementDbService.delete(id);
  }
}
