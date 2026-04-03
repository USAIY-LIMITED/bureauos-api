import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { IamModule } from './iam/iam.module';
import { AccountsModule } from './accounts/accounts.module';
import { UsersModule } from './users/users.module';
import { WaitlistsModule } from './waitlists/waitlists.module';
import { EmailManagementsModule } from './email-managements/email-managements.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    CoreModule,
    IamModule,
    AccountsModule,
    UsersModule,
    WaitlistsModule,
    EmailManagementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
