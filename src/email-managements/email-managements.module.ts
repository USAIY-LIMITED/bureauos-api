import { Global, Module } from '@nestjs/common';
import { EmailManagementsService } from './email-managements.service';
import { EmailManagementsController } from './email-managements.controller';
import { EmailManagementDbService } from './email-management.db.service';

@Global()
@Module({
  controllers: [EmailManagementsController],
  providers: [EmailManagementsService, EmailManagementDbService],
  exports: [EmailManagementsService, EmailManagementDbService],
})
export class EmailManagementsModule {}
