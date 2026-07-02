import { Module } from '@nestjs/common';
import { WaitlistsService } from './waitlists.service';
import { WaitlistsController } from './waitlists.controller';
import { CoreModule } from '@app/core/core.module';
import { WaitlistsDbService } from './waitlists.db.service';
import { WaitlistsSegmentationService } from './waitlists.segmentation.service';
import { WaitlistsOrchestrationService } from './waitlists.orchestration.service';

@Module({
  imports: [CoreModule],
  controllers: [WaitlistsController],
  providers: [
    WaitlistsService,
    WaitlistsDbService,
    WaitlistsSegmentationService,
    WaitlistsOrchestrationService,
  ],
  exports: [
    WaitlistsService,
    WaitlistsDbService,
    WaitlistsSegmentationService,
    WaitlistsOrchestrationService,
  ],
})
export class WaitlistsModule {}
