import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from 'src/users/entities/user.entity';

@Unique(['post', 'user'])
@Entity('post_favorites')
export class PostFavorite {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Favorite ID' })
  id: number;

  @ManyToOne(() => Post, (post) => post.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  @ApiProperty({ type: () => Post, required: false })
  post: Post;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ type: () => User, required: false })
  user: User;

  @CreateDateColumn()
  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Created at' })
  created_at: Date;
}
