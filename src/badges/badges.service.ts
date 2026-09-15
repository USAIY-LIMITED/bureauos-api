import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/core/database/prisma.service';
import {
  AccountBadgesDbService,
  BadgeDefinitionsDbService,
} from './badges.db.service';

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly badgeDefinitionsDb: BadgeDefinitionsDbService,
    private readonly accountBadgesDb: AccountBadgesDbService,
  ) {}

  findHoldersOfBadge(slug: string, paginationOptions: any = {}) {
    return this.accountBadgesDb.findAll(
      { badgeSlug: slug },
      paginationOptions,
      ['badge'],
    );
  }

  findForAccount(accountId: number) {
    return this.prisma.accountBadge.findMany({
      where: { accountId, revokedAt: null, deletedAt: null },
      include: { badge: true },
      orderBy: { earnedAt: 'asc' },
    });
  }

  /**
   * Issues `slug` to `accountId`. For capped badges (the founding cohort),
   * the count-and-assign runs inside a serializable transaction so two
   * simultaneous issuances at the cap boundary can't both succeed — once
   * `cap` holders exist the badge is permanently closed, no error surfaced,
   * the criteria job just stops issuing it.
   */
  async issueBadge(accountId: number, slug: string) {
    const badge: { cap: number | null } | null =
      await this.badgeDefinitionsDb.findBySlug(slug);
    if (!badge) {
      this.logger.warn(`Attempted to issue unknown badge slug "${slug}"`);
      return null;
    }

    const existing = await this.prisma.accountBadge.findUnique({
      where: { accountId_badgeSlug: { accountId, badgeSlug: slug } },
    });
    if (existing && !existing.revokedAt) return existing;

    const cap = badge.cap;
    if (!cap) {
      return this.prisma.accountBadge.upsert({
        where: { accountId_badgeSlug: { accountId, badgeSlug: slug } },
        update: { revokedAt: null, earnedAt: new Date() },
        create: { accountId, badgeSlug: slug },
      });
    }

    return this.prisma.$transaction(
      async (tx) => {
        const holderCount = await tx.accountBadge.count({
          where: { badgeSlug: slug, revokedAt: null },
        });
        if (holderCount >= cap) {
          this.logger.log(`Badge "${slug}" is closed — cap of ${cap} reached`);
          return null;
        }

        const lastSerial = await tx.accountBadge.aggregate({
          where: { badgeSlug: slug },
          _max: { serialNumber: true },
        });
        const serialNumber = (lastSerial._max.serialNumber ?? 0) + 1;

        return tx.accountBadge.upsert({
          where: { accountId_badgeSlug: { accountId, badgeSlug: slug } },
          update: { revokedAt: null, earnedAt: new Date(), serialNumber },
          create: { accountId, badgeSlug: slug, serialNumber },
        });
      },
      { isolationLevel: 'Serializable' },
    );
  }

  async revokeBadge(accountId: number, slug: string) {
    return this.prisma.accountBadge.update({
      where: { accountId_badgeSlug: { accountId, badgeSlug: slug } },
      data: { revokedAt: new Date() },
    });
  }
}
