import { Module } from '@nestjs/common';
import { WaitlistsService } from './waitlists.service';
import { WaitlistsController } from './waitlists.controller';
import { CoreModule } from '@app/core/core.module';
import { WaitlistsDbService } from './waitlists.db.service';

@Module({
  imports: [CoreModule],
  controllers: [WaitlistsController],
  providers: [WaitlistsService, WaitlistsDbService],
  exports: [WaitlistsService, WaitlistsDbService],
})
export class WaitlistsModule {}
