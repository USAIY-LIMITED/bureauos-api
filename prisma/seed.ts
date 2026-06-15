import { seedEmailManagements } from '@app/email-managements/seed';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding BureauOS Ecosystem...');

  await seedEmailManagements(prisma);

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
