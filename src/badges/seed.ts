import type { PrismaClient } from '@prisma/client';
import { BADGE_CATALOGUE } from './badges.catalogue';

export async function seedBadges(prisma: PrismaClient) {
  for (const badge of BADGE_CATALOGUE) {
    const seeded = await prisma.badgeDefinition.upsert({
      where: { slug: badge.slug },
      update: { track: badge.track, tier: badge.tier, cap: badge.cap ?? null },
      create: {
        slug: badge.slug,
        track: badge.track,
        tier: badge.tier,
        cap: badge.cap ?? null,
      },
    });

    console.log('Badge Definition Seeded:', seeded.slug);
  }
}
