import { PrismaClient, AccountType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as readline from 'readline';
import { Writable } from 'stream';

const prisma = new PrismaClient();

// Custom writable stream to securely mask password typing
const mutableStdout = new Writable({
  write(chunk, encoding, callback) {
    if (!(this as any).muted) {
      process.stdout.write(chunk, encoding);
    }
    callback();
  },
}) as any;
mutableStdout.muted = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: mutableStdout,
  terminal: true,
});

function ask(query: string, isPassword = false): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      if (isPassword) {
        process.stdout.write('\n');
      }
      resolve(answer);
    });
    if (isPassword) {
      mutableStdout.muted = true;
    }
  });
}

async function main() {
  console.log('\n==================================================');
  console.log('       BureauOS Production Bootstrap Utility      ');
  console.log('==================================================\n');

  try {
    const firstName = (await ask('Admin First Name [default: System]: ')).trim() || 'System';
    const lastName = (await ask('Admin Last Name [default: Admin]: ')).trim() || 'Admin';

    let email = '';
    while (!email) {
      const input = (await ask('Admin Email (required): ')).trim();
      if (input && input.includes('@')) {
        email = input.toLowerCase();
      } else {
        console.log('❌ Invalid email address. Please try again.');
      }
    }

    let password = '';
    while (!password) {
      const input = await ask('Admin Password (required): ', true);
      if (input.length >= 8) {
        password = input;
      } else {
        console.log('❌ Password must be at least 8 characters long.');
      }
    }

    rl.close();

    console.log('\n⏳ Initializing database connection...');
    await prisma.$connect();

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log(`❌ Error: User with email ${email} already exists in the database.`);
      return;
    }

    console.log('⏳ Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('⏳ Creating admin user and account...');
    const user = await prisma.user.create({
      data: {
        email,
        firstName: firstName.toUpperCase(),
        lastName: lastName.toUpperCase(),
        password: hashedPassword,
        isActivated: true,
        isTermsAccepted: true,
        isFirstLogin: false,
      },
    });

    const account = await prisma.account.create({
      data: {
        type: AccountType.ADMIN,
        identityCode: 'BOS-ADMIN-0001',
        users: { connect: { id: user.id } },
        admin: {
          create: {
            firstName: firstName.toUpperCase(),
            lastName: lastName.toUpperCase(),
            email,
          },
        },
      },
    });

    console.log('⏳ Generating secure API Gateway Key...');
    const gatewayKey = crypto.randomBytes(16).toString('hex'); // 32-character secure hex key
    const gatewaySlug = 'bureauos-client-apps';

    await prisma.apiGateway.upsert({
      where: { slug: gatewaySlug },
      update: {
        key: gatewayKey,
        accountId: account.id,
        isEnabled: true,
      },
      create: {
        key: gatewayKey,
        slug: gatewaySlug,
        name: 'BureauOS Client Apps',
        accountId: account.id,
        isEnabled: true,
        rateLimit: 100,
        burstLimit: 20,
        config: {
          clients: ['mobile', 'web', 'desktop'],
        },
      },
    });

    console.log('\n==================================================');
    console.log('🎉 BureauOS Ecosystem Bootstrapped Successfully!');
    console.log('==================================================');
    console.log(`👤 Admin Email:      ${email}`);
    console.log(`🔑 API Gateway Key:  ${gatewayKey}`);
    console.log('==================================================');
    console.log('⚠️ IMPORTANT: Copy the API Gateway Key above and');
    console.log('use it as VITE_API_GATEWAY_KEY in your frontend .env.\n');

  } catch (error) {
    console.error('\n❌ Bootstrap failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
