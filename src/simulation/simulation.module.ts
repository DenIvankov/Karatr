import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from 'src/comments/comments.module';
import { PostFavorite } from 'src/posts/entities/post-favorite.entity';
import { PostLike } from 'src/posts/entities/post-like.entity';
import { Post } from 'src/posts/entities/post.entity';
import { PostsModule } from 'src/posts/posts.module';
import { User } from 'src/users/entities/user.entity';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post, PostLike, PostFavorite]),
    PostsModule,
    CommentsModule,
  ],
  controllers: [SimulationController],
  providers: [SimulationService],
  exports: [SimulationService],
})
export class SimulationModule {}
