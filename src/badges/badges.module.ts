import { Module } from '@nestjs/common';
import { CoreModule } from '@app/core/core.module';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import {
  AccountBadgesDbService,
  BadgeDefinitionsDbService,
} from './badges.db.service';

@Module({
  imports: [CoreModule],
  controllers: [BadgesController],
  providers: [BadgesService, BadgeDefinitionsDbService, AccountBadgesDbService],
  exports: [BadgesService, BadgeDefinitionsDbService, AccountBadgesDbService],
})
export class BadgesModule {}
