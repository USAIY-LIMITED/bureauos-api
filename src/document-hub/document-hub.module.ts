import { Module } from '@nestjs/common';
import { CoreModule } from '@app/core/core.module';
import { DocumentHubController } from './document-hub.controller';
import { DocumentHubService } from './document-hub.service';

@Module({
  imports: [CoreModule],
  controllers: [DocumentHubController],
  providers: [DocumentHubService],
  exports: [DocumentHubService],
})
export class DocumentHubModule {}
