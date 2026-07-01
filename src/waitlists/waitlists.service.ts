import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateWaitlistDto } from './dto/waitlist.dto';
import { EmailManagementsService } from '@app/email-managements/email-managements.service';
import { AuditLogsService } from '@app/core/audit-logs/audit-logs.service';
import { WaitlistsDbService } from './waitlists.db.service';

@Injectable()
export class WaitlistsService {
  constructor(
    private waitlistDbService: WaitlistsDbService,
    private emailService: EmailManagementsService,
    private auditLogsService: AuditLogsService,
  ) { }

  async create(dto: CreateWaitlistDto) {
    const existing = await this.waitlistDbService.findFirst({ email: dto.email });

    if (existing) {
      throw new ConflictException('Email already subscribed to waitlist');
    }

    const waitlist = await this.waitlistDbService.create(dto);

    const [firstName = '', ...lastNameParts] = dto.fullName.trim().split(/\s+/);
    const lastName = lastNameParts.join(' ') || '';

    await this.emailService
      .sendMail(dto.email, 'waitlist-welcome', {
        firstName,
        lastName,
      })
      .catch((e) => console.error('Failed to send waitlist welcome email', e));

    this.auditLogsService.log({
      action: 'JOINED',
      entity: 'Waitlist',
      entityId: String(waitlist.id),
      details: {
        email: dto.email,
        accountType: dto.accountType,
        fullName: dto.fullName,
        expansionTarget: dto.expansionTarget,
      },
    }).catch(() => { });

    return waitlist;
  }

  async findAll() {
    const [data] = await this.waitlistDbService.findAll({ sortKey: 'createdAt', sortDir: 'desc' });
    return data;
  }

  async findByEmail(email: string) {
    return this.waitlistDbService.findFirst({ email });
  }

  async unsubscribe(email: string) {
    const existing = await this.waitlistDbService.findFirst({ email });
    if (!existing) {
      throw new NotFoundException('Subscriber not found');
    }
    return this.waitlistDbService.update(existing.id, { subscribed_for_waitlist: false });
  }
}
