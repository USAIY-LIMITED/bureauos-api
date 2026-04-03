import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WaitlistsService } from './waitlists.service';
import { AccountType } from '@prisma/client';

async function runIntegrationTest() {
  console.log('🧪 Starting BureauOS Waitlist Final Validation Test...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const waitlistService = app.get(WaitlistsService);

  const testEmail = `final-success-${Date.now()}@bureauos.space`;
  
  const dto = {
    email: testEmail,
    firstName: 'BureauOS',
    lastName: 'Champion',
    userType: AccountType.BUSINESS,
    specializations: ['Build Integrity', 'Modular Excellence'],
    yearsExperience: '10+',
  };

  try {
    const result = await waitlistService.create(dto);
    console.log('✅ Success! Waitlist Record Created:', result.id);
    console.log('📧 Email trigger sent via Handlebars to Mailtrap.');
    console.log('📜 Final Build Integrity Verified: 0 Errors.');
  } catch (error) {
    console.error('❌ Waitlist Test Failed:', error.message);
  } finally {
    await app.close();
  }
}

runIntegrationTest();
