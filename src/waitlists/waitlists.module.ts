import { Module } from '@nestjs/common';
import { WaitlistsService } from './waitlists.service';
import { WaitlistsController } from './waitlists.controller';
import { CoreModule } from '@app/core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [WaitlistsController],
  providers: [WaitlistsService],
  exports: [WaitlistsService],
})
export class WaitlistsModule {}
