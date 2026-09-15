import { Module } from '@nestjs/common';
import { BusinessEntitiesService } from './business-entities.service';
import { BusinessEntitiesController } from './business-entities.controller';
import { BusinessEntitiesDbService } from './business-entities.db.service';
import { CoreModule } from '@app/core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [BusinessEntitiesController],
  providers: [BusinessEntitiesService, BusinessEntitiesDbService],
  exports: [BusinessEntitiesService, BusinessEntitiesDbService],
})
export class BusinessEntitiesModule {}
