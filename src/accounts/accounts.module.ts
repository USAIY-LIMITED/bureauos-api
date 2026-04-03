import { forwardRef, Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { AccountDatabaseService } from '@app/accounts/accounts.db.service';
import { AccountProfileController } from '@app/accounts/account-profile.controller';
import { UsersModule } from '@app/users/users.module';
import { EmailManagementsModule } from '@app/email-managements/email-managements.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    EmailManagementsModule,
  ],
  controllers: [
    AccountsController,
    AccountProfileController,
  ],
  providers: [AccountDatabaseService, AccountsService],
  exports: [AccountsService, AccountDatabaseService],
})
export class AccountsModule {}
