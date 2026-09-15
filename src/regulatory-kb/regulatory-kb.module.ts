import { Module } from '@nestjs/common';
import { RegulatoryKbService } from './regulatory-kb.service';
import { RegulatoryKbController } from './regulatory-kb.controller';
import { RegulatoryKbDbService } from './regulatory-kb.db.service';
import { CoreModule } from '@app/core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [RegulatoryKbController],
  providers: [RegulatoryKbService, RegulatoryKbDbService],
  exports: [RegulatoryKbService, RegulatoryKbDbService],
})
export class RegulatoryKbModule {}
