import type { PrismaClient } from '@prisma/client';

export const apiGatewaySeedDefaults = {
  key: process.env.SEED_API_GATEWAY_KEY || 'bureauos-dev-api-key',
  slug: process.env.SEED_API_GATEWAY_SLUG || 'bureauos-client-apps',
  name: process.env.SEED_API_GATEWAY_NAME || 'BureauOS Client Apps',
};

export async function seedApiGateway(
  prisma: PrismaClient,
  accountId: number,
) {
  const gateway = await prisma.apiGateway.upsert({
    where: { slug: apiGatewaySeedDefaults.slug },
    update: {
      key: apiGatewaySeedDefaults.key,
      name: apiGatewaySeedDefaults.name,
      accountId,
      isEnabled: true,
      rateLimit: 100,
      burstLimit: 20,
      config: {
        clients: ['mobile', 'web', 'desktop'],
      },
      deletedAt: null,
    },
    create: {
      key: apiGatewaySeedDefaults.key,
      slug: apiGatewaySeedDefaults.slug,
      name: apiGatewaySeedDefaults.name,
      accountId,
      isEnabled: true,
      rateLimit: 100,
      burstLimit: 20,
      config: {
        clients: ['mobile', 'web', 'desktop'],
      },
    },
  });

  console.log('API Gateway Key Seeded:', gateway.slug);

  return gateway;
}
