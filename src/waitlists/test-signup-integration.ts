import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WaitlistsService } from './waitlists.service';
import { AccountType } from '@prisma/client';

async function runIntegrationTest() {
  console.log('🧪 Starting Waitlist Signup Integration Test (FIXED CONTENT)...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const waitlistService = app.get(WaitlistsService);

  const testEmail = `verify-body-${Date.now()}@bureauos.space`;
  
  const dto = {
    email: testEmail,
    firstName: 'Verified',
    lastName: 'Consumer',
    userType: AccountType.BUSINESS,
    specializations: ['UI/UX', 'Node 22'],
    yearsExperience: '10+',
  };

  try {
    const result = await waitlistService.create(dto);
    console.log('✅ Success! Waitlist Record Created:', result.id);
    console.log('📧 Email trigger sent to Mailtrap. Body variable should be populated now.');
  } catch (error) {
    console.error('❌ Integration Test Failed:', error.message);
  } finally {
    await app.close();
  }
}

runIntegrationTest();
