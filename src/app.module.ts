import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { IamModule } from './iam/iam.module';
import { AccountsModule } from './accounts/accounts.module';
import { UsersModule } from './users/users.module';
import { WaitlistsModule } from './waitlists/waitlists.module';
import { EmailManagementsModule } from './email-managements/email-managements.module';
import { BlogModule } from './blog/blog.module';
import { DocumentHubModule } from './document-hub/document-hub.module';
import { RegulatoryKbModule } from './regulatory-kb/regulatory-kb.module';
import { BusinessEntitiesModule } from './business-entities/business-entities.module';

import appConfig from './core/config/app.config';
import mailConfig from './core/config/mail.config';
import swaggerConfig from './core/config/swagger.config';
import uploadConfig from './core/config/upload.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, mailConfig, swaggerConfig, uploadConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    CoreModule,
    IamModule,
    AccountsModule,
    UsersModule,
    WaitlistsModule,
    EmailManagementsModule,
    BlogModule,
    DocumentHubModule,
    RegulatoryKbModule,
    BusinessEntitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
