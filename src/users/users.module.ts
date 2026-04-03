import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { UserDatabaseService } from '@app/users/db/users.db.service';
import { HashingService } from '@app/users/hashing.service';

@Module({
  controllers: [UserController],
  providers: [UserService, UserDatabaseService, HashingService],
  exports: [UserService, UserDatabaseService, HashingService],
})
export class UsersModule {}
