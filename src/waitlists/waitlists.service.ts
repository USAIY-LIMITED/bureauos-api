import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '@app/core/database/prisma.service';
import { CreateWaitlistDto } from './dto/waitlist.dto';
import { EmailManagementsService } from '@app/email-managements/email-managements.service';

@Injectable()
export class WaitlistsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailManagementsService,
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

    // Send welcome email
    try {
      await this.emailService.sendMail(dto.email, 'waitlist-welcome', {
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
    } catch (e) {
      console.error('Failed to send waitlist welcome email', e);
    }

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
