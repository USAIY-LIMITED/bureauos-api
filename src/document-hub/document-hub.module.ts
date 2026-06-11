import { Module } from '@nestjs/common';
import { CoreModule } from '@app/core/core.module';
import { DocumentHubController } from './document-hub.controller';
import { DocumentHubService } from './document-hub.service';
import { DocumentHubDbService } from './document-hub.db.service';

@Module({
  imports: [CoreModule],
  controllers: [DocumentHubController],
  providers: [DocumentHubService, DocumentHubDbService],
  exports: [DocumentHubService, DocumentHubDbService],
})
export class DocumentHubModule {}
