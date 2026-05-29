import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '@app/core/database/prisma.service';
import { CreateWaitlistDto } from './dto/waitlist.dto';
import { EmailManagementsService } from '@app/email-managements/email-managements.service';
import { AuditLogsService } from '@app/core/audit-logs/audit-logs.service';

@Injectable()
export class WaitlistsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailManagementsService,
    private auditLogsService: AuditLogsService,
  ) {}

  async create(dto: CreateWaitlistDto) {
    const existing = await this.prisma.waitlist.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already subscribed to waitlist');
    }

    const waitlist = await this.prisma.waitlist.create({
      data: dto,
    });

    await this.emailService
      .sendMail(dto.email, 'waitlist-welcome', {
        firstName: dto.firstName,
        lastName: dto.lastName,
      })
      .catch((e) => console.error('Failed to send waitlist welcome email', e));

    this.auditLogsService.log({
      action: 'JOINED',
      entity: 'Waitlist',
      entityId: String(waitlist.id),
      details: { email: dto.email, userType: dto.userType },
    }).catch(() => {});

    return waitlist;
  }

  async findAll() {
    return this.prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.waitlist.findUnique({
      where: { email },
    });
  }

  async unsubscribe(email: string) {
    return this.prisma.waitlist.update({
      where: { email },
      data: { subscribed_for_waitlist: false },
    });
  }
}
