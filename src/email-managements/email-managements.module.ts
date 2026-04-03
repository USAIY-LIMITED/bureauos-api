import { Global, Module } from '@nestjs/common';
import { EmailManagementsService } from './email-managements.service';
import { EmailManagementsController } from './email-managements.controller';

@Global()
@Module({
  controllers: [EmailManagementsController],
  providers: [EmailManagementsService],
  exports: [EmailManagementsService],
})
export class EmailManagementsModule {}
