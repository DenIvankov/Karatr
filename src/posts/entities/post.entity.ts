import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { PostLike } from './post-like.entity';
import { PostMedia } from './post-media.entity';
import { PostFavorite } from './post-favorite.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Post ID' })
  id: number;

  @Column()
  @ApiProperty({ example: 'Мой первый пост', description: 'Post title' })
  title: string;

  @Column()
  @ApiProperty({ example: 'Текст поста', description: 'Post content' })
  content: string;

  @Column({ name: 'comments_count', type: 'int', default: 0 })
  @ApiProperty({ example: 5, description: 'Comments count' })
  commentsCount: number;

  @Column({ name: 'likes_count', type: 'int', default: 0 })
  @ApiProperty({ example: 12, description: 'Likes count' })
  likesCount: number;

  @Column({ name: 'views_count', type: 'int', default: 0 })
  @ApiProperty({ example: 145, description: 'Views count' })
  viewsCount: number;

  @ApiProperty({
    example: true,
    description: 'Whether current authorized user liked this post',
    required: false,
  })
  currentUserLiked?: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether current authorized user favorited this post',
    required: false,
  })
  currentUserFavorited?: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Created at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn()
  @ApiProperty({ type: () => User, required: false })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  @ApiProperty({ type: () => [Comment], required: false })
  comments: Comment[];

  @OneToMany(() => PostLike, (likes) => likes.post)
  @ApiProperty({ type: () => [PostLike], required: false })
  likes: PostLike[];

  @OneToMany(() => PostFavorite, (favorites) => favorites.post)
  @ApiProperty({ type: () => [PostFavorite], required: false })
  favorites: PostFavorite[];

  @OneToMany(() => PostMedia, (media) => media.post)
  @ApiProperty({ type: () => [PostMedia], required: false })
  media: PostMedia[];
}
