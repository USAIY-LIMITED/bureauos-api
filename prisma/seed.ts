import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BureauOS Ecosystem...');

  // 1. Create Default Email Template
  const welcomeTemplate = await prisma.emailTemplate.upsert({
    where: { slug: 'waitlist-welcome' },
    update: {
      subject: 'Welcome to BureauOS!',
      title: 'Success! You are on the Waitlist',
      body: ` 
            <h1 style="color: #1A1813; font-size: 30px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.02em;">
                You're in — BureauOS Early Access</h1>
 
            <div style="color: #524D44; font-size: 17px; margin-bottom: 32px; font-weight: 400;">
                Hi {{firstName}} {{lastName}}, <br/> you've been added to the early access list.
            </div>
 
            <div
                style="background-color: #F4F1EC; border-radius: 20px; padding: 32px; margin-bottom: 32px; border: 1px solid #E4DFD6; text-align: left;">
                <div
                    style="display: inline-block; background: #FBFAF8; padding: 12px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="#2C5378" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                </div>
                <div style="color: #1A1813; font-size: 17px; font-weight: 700; margin-bottom: 10px;">What we're building
                </div>
                <p style="color: #524D44; font-size: 15px; line-height: 1.7; margin: 0;">
                    We're building a structured system for business compliance and cross-border operations — starting
                    with founders and professionals navigating markets like the UK.
                </p>
                <p style="color: #524D44; font-size: 15px; line-height: 1.7; margin: 14px 0 0 0;">You'll be among the
                    first to:</p>
                <ul style="margin: 14px 0 0 0; padding: 0; list-style: none;">
                    <li
                        style="display: flex; align-items: flex-start; gap: 10px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 10px;">
                        <span
                            style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
                        Access the platform
                    </li>
                    <li
                        style="display: flex; align-items: flex-start; gap: 10px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 10px;">
                        <span
                            style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
                        Test early workflows
                    </li>
                    <li
                        style="display: flex; align-items: flex-start; gap: 10px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 10px;">
                        <span
                            style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
                        Understand how businesses are structured across jurisdictions
                    </li>
                </ul>
            </div>
 
            <div style="border-left: 3px solid #D6CFC2; padding: 12px 20px; margin: 24px 0; text-align: left;">
                <p
                    style="color: #524D44; font-size: 14px; font-style: italic; font-weight: 500; margin: 0; line-height: 1.6;">
                    Most businesses don't fail because of product — they fail because of structure.
                </p>
            </div>
 
            <div style="text-align: left; margin-top: 32px; padding-top: 32px; border-top: 1px solid #E4DFD6;">
                <div
                    style="text-transform: uppercase; font-size: 12px; font-weight: 700; color: #8C857A; letter-spacing: 0.1em; margin-bottom: 20px; text-align: center;">
                    What's Next?</div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 14px;">
                    <div
                        style="background: #EDE9E2; color: #2C5378; width: 24px; height: 24px; min-width: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; margin-right: 12px; margin-top: 2px;">
                        1</div>
                    <div style="color: #524D44; font-size: 14px; font-weight: 500; padding-top: 3px;">We'll share
                        platform updates as we build</div>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 14px;">
                    <div
                        style="background: #EDE9E2; color: #2C5378; width: 24px; height: 24px; min-width: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; margin-right: 12px; margin-top: 2px;">
                        2</div>
                    <div style="color: #524D44; font-size: 14px; font-weight: 500; padding-top: 3px;">You'll get early
                        access before the public launch</div>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 14px;">
                    <div
                        style="background: #EDE9E2; color: #2C5378; width: 24px; height: 24px; min-width: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; margin-right: 12px; margin-top: 2px;">
                        3</div>
                    <div style="color: #524D44; font-size: 14px; font-weight: 500; padding-top: 3px;">Shape workflows
                        with your real-world feedback</div>
                </div>
            </div>`,
    },
    create: {
      slug: 'waitlist-welcome',
      subject: 'Welcome to BureauOS!',
      title: 'Success! You are on the Waitlist',
      body: ` 
            <h1 style="color: #1A1813; font-size: 30px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.02em;">
                You're in — BureauOS Early Access</h1>
 
            <div style="color: #524D44; font-size: 17px; margin-bottom: 32px; font-weight: 400;">
                Hi {{firstName}} {{lastName}}, <br/> you've been added to the early access list.
            </div>
 
            <div
                style="background-color: #F4F1EC; border-radius: 20px; padding: 32px; margin-bottom: 32px; border: 1px solid #E4DFD6; text-align: left;">
                <div
                    style="display: inline-block; background: #FBFAF8; padding: 12px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="#2C5378" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                </div>
                <div style="color: #1A1813; font-size: 17px; font-weight: 700; margin-bottom: 10px;">What we're building
                </div>
                <p style="color: #524D44; font-size: 15px; line-height: 1.7; margin: 0;">
                    We're building a structured system for business compliance and cross-border operations — starting
                    with founders and professionals navigating markets like the UK.
                </p>
                <p style="color: #524D44; font-size: 15px; line-height: 1.7; margin: 14px 0 0 0;">You'll be among the
                    first to:</p>
                <ul style="margin: 14px 0 0 0; padding: 0; list-style: none;">
                    <li
                        style="display: flex; align-items: flex-start; gap: 10px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 10px;">
                        <span
                            style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
                        Access the platform
                    </li>
                    <li
                        style="display: flex; align-items: flex-start; gap: 10px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 10px;">
                        <span
                            style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
                        Test early workflows
                    </li>
                    <li
                        style="display: flex; align-items: flex-start; gap: 10px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 10px;">
                        <span
                            style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
                        Understand how businesses are structured across jurisdictions
                    </li>
                </ul>
            </div>
 
            <div style="border-left: 3px solid #D6CFC2; padding: 12px 20px; margin: 24px 0; text-align: left;">
                <p
                    style="color: #524D44; font-size: 14px; font-style: italic; font-weight: 500; margin: 0; line-height: 1.6;">
                    Most businesses don't fail because of product — they fail because of structure.
                </p>
            </div>
 
            <div style="text-align: left; margin-top: 32px; padding-top: 32px; border-top: 1px solid #E4DFD6;">
                <div
                    style="text-transform: uppercase; font-size: 12px; font-weight: 700; color: #8C857A; letter-spacing: 0.1em; margin-bottom: 20px; text-align: center;">
                    What's Next?</div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 14px;">
                    <div
                        style="background: #EDE9E2; color: #2C5378; width: 24px; height: 24px; min-width: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; margin-right: 12px; margin-top: 2px;">
                        1</div>
                    <div style="color: #524D44; font-size: 14px; font-weight: 500; padding-top: 3px;">We'll share
                        platform updates as we build</div>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 14px;">
                    <div
                        style="background: #EDE9E2; color: #2C5378; width: 24px; height: 24px; min-width: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; margin-right: 12px; margin-top: 2px;">
                        2</div>
                    <div style="color: #524D44; font-size: 14px; font-weight: 500; padding-top: 3px;">You'll get early
                        access before the public launch</div>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 14px;">
                    <div
                        style="background: #EDE9E2; color: #2C5378; width: 24px; height: 24px; min-width: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; margin-right: 12px; margin-top: 2px;">
                        3</div>
                    <div style="color: #524D44; font-size: 14px; font-weight: 500; padding-top: 3px;">Shape workflows
                        with your real-world feedback</div>
                </div>
            </div>`,
    },
  });
  console.log('✅ Email Template Seeded:', welcomeTemplate.slug);

  const verificationTemplate = await prisma.emailTemplate.upsert({
    where: { slug: 'email-verification' },
    update: {},
    create: {
      slug: 'email-verification',
      subject: 'Verify your BureauOS account',
      title: 'Your verification code',
      body: `
        <h1 style="color: #0f172a; font-size: 26px; font-weight: 800; margin: 0 0 12px;">
          Verify your email address
        </h1>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 32px;">
          Hi {{firstName}}, use the code below to verify your BureauOS account.
          This code expires in 15 minutes.
        </p>
        <div style="background: #f0f7ff; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px; border: 1px solid #e0f0ff;">
          <div style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #1d4ed8; font-family: monospace;">
            {{code}}
          </div>
        </div>
        <p style="color: #94a3b8; font-size: 13px; text-align: center;">
          If you did not request this, you can safely ignore this email.
        </p>`,
    },
  });
  console.log('✅ Email Template Seeded:', verificationTemplate.slug);

  const resetTemplate = await prisma.emailTemplate.upsert({
    where: { slug: 'password-reset' },
    update: {},
    create: {
      slug: 'password-reset',
      subject: 'Reset your BureauOS password',
      title: 'Password reset request',
      body: `
        <h1 style="color: #0f172a; font-size: 26px; font-weight: 800; margin: 0 0 12px;">
          Reset your password
        </h1>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 32px;">
          Hi {{firstName}}, we received a request to reset your password.
          Click the button below — this link expires in 1 hour.
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="{{resetUrl}}"
            style="display: inline-block; background: #1d4ed8; color: #ffffff; font-size: 16px;
                   font-weight: 700; padding: 16px 40px; border-radius: 12px; text-decoration: none;">
            Reset Password
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; text-align: center;">
          If you did not request a password reset, you can safely ignore this email.
        </p>`,
    },
  });
  console.log('✅ Email Template Seeded:', resetTemplate.slug);

  // 2. Create Base Records (Example)
  const records = [
    { name: 'Financial Services', slug: 'financial-services', type: 'PRIMARY_EXPERTISE' },
    { name: 'Legal Compliance', slug: 'legal-compliance', type: 'PRIMARY_EXPERTISE' },
    { name: 'AI Automation', slug: 'ai-automation', type: 'SPECIALIZATION' },
  ];

  for (const record of records) {
    await prisma.baseRecord.upsert({
      where: { slug: record.slug },
      update: {},
      create: record as any,
    });
  }
  console.log('✅ Base Records Seeded');

  console.log('🚀 Seeding Completed Successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
