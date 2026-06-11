import { seedAdminAccount } from '@app/accounts/seed';
import { seedApiGateway } from '@app/core/api-gateway/seed';
import { seedEmailManagements } from '@app/email-managements/seed';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBaseRecords() {
  const records = [
    {
      name: 'Financial Services',
      slug: 'financial-services',
      type: 'PRIMARY_EXPERTISE',
    },
    {
      name: 'Legal Compliance',
      slug: 'legal-compliance',
      type: 'PRIMARY_EXPERTISE',
    },
    { name: 'AI Automation', slug: 'ai-automation', type: 'SPECIALIZATION' },
  ];

  for (const record of records) {
    await prisma.baseRecord.upsert({
      where: { slug: record.slug },
      update: {},
      create: record as any,
    });
  }

  console.log('Base Records Seeded');
}

async function main() {
  console.log('Seeding BureauOS Ecosystem...');

  const { account: adminAccount } = await seedAdminAccount(prisma);
  await seedApiGateway(prisma, adminAccount.id);
  await seedEmailManagements(prisma);
  await seedBaseRecords();

  console.log('Seeding Completed Successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
