import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from 'src/users/entities/user.entity';

@Unique(['post', 'user'])
@Entity('post_likes')
export class PostLike {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Like ID' })
  id: number;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  @ApiProperty({ type: () => Post, required: false })
  post: Post;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ type: () => User, required: false })
  user: User;

  @CreateDateColumn()
  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Created at' })
  created_at: Date;
}
