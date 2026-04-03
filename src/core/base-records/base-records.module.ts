import { Module } from '@nestjs/common';
import { BaseRecordsService } from './base-records.service';
import { BaseRecordsController } from './base-records.controller';

@Module({
  controllers: [BaseRecordsController],
  providers: [BaseRecordsService],
  exports: [BaseRecordsService],
})
export class BaseRecordsModule {}
