import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostMedia } from './entities/post-media.entity';
import { PostFavorite } from './entities/post-favorite.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { HashtagsModule } from 'src/hashtags/hashtags.module';
import { Hashtag } from 'src/hashtags/entities/hashtag.entity';
import { PostHashtag } from 'src/hashtags/entities/post-hashtag.entity';
import { PostsController } from './posts.controller';
import { PostsSeedService } from './posts-seed.service';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Post,
      PostLike,
      PostFavorite,
      PostMedia,
      Hashtag,
      PostHashtag,
    ]),
    NotificationsModule,
    HashtagsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsSeedService],
  exports: [PostsService],
})
export class PostsModule {}
