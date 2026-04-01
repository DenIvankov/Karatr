import { Module } from '@nestjs/common';
import { FollowerService } from './follower.service';
import { FollowerController } from './follower.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follower } from './entities/follower.entity';
import { User } from 'src/users/entities/user.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  controllers: [FollowerController],
  providers: [FollowerService],
  imports: [TypeOrmModule.forFeature([Follower, User]), NotificationsModule],
  exports: [FollowerService],
})
export class FollowerModule {}
