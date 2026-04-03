import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/core/database/prisma.service';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailManagementsService {
  private transporter;
  private templateLoader;

  constructor(private readonly prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
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
    const template = await this.prisma.emailTemplate.findUnique({
      where: { slug },
    });

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

    const mailOptions = {
      from: process.env.MAIL_FROM || '"BureauOS" <hello@bureauos.space>',
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
    return this.prisma.emailTemplate.create({ data });
  }

  async findAllTemplates() {
    return this.prisma.emailTemplate.findMany({
      where: { deletedAt: null },
    });
  }

  async findOneTemplate(id: number) {
    return this.prisma.emailTemplate.findUnique({
      where: { id },
    });
  }

  async updateTemplate(id: number, data: any) {
    return this.prisma.emailTemplate.update({
      where: { id },
      data,
    });
  }

  async removeTemplate(id: number) {
    return this.prisma.emailTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
