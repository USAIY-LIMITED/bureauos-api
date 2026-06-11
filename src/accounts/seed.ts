import type { PrismaClient } from '@prisma/client';
import { AccountType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export const adminSeedDefaults = {
  email: process.env.SEED_ADMIN_EMAIL || 'admin@bureauos.space',
  password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
  firstName: process.env.SEED_ADMIN_FIRST_NAME || 'BureauOS',
  lastName: process.env.SEED_ADMIN_LAST_NAME || 'Admin',
};

export async function seedAdminAccount(prisma: PrismaClient) {
  const email = adminSeedDefaults.email.toLowerCase().trim();
  const firstName = adminSeedDefaults.firstName.toUpperCase().trim();
  const lastName = adminSeedDefaults.lastName.toUpperCase().trim();
  const password = await bcrypt.hash(adminSeedDefaults.password, 15);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      firstName,
      lastName,
      password,
      isActivated: true,
      isTermsAccepted: true,
      deletedAt: null,
    },
    create: {
      email,
      firstName,
      lastName,
      password,
      isActivated: true,
      isTermsAccepted: true,
      isFirstLogin: false,
    },
  });

  const existingAccount = await prisma.account.findFirst({
    where: {
      type: AccountType.ADMIN,
      deletedAt: null,
      users: { some: { id: user.id } },
    },
    include: { admin: true },
  });

  const adminData = { firstName, lastName, email };

  const account = existingAccount
    ? await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          users: { connect: { id: user.id } },
          admin: {
            upsert: {
              update: adminData,
              create: adminData,
            },
          },
        },
      })
    : await prisma.account.create({
        data: {
          type: AccountType.ADMIN,
          identityCode: 'BOS-ADMIN-0001',
          users: { connect: { id: user.id } },
          admin: { create: adminData },
        },
      });

  console.log('Admin Account Seeded:', email);

  return { user, account };
}
