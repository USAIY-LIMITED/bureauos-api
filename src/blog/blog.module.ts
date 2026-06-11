import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { BlogDbService } from './blog.db.service';
import { CoreModule } from '@app/core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [BlogController],
  providers: [BlogService, BlogDbService],
  exports: [BlogService, BlogDbService],
})
export class BlogModule {}
