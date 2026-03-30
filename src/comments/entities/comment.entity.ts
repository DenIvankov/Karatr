import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Comment ID' })
  id: number;

  @Column()
  @ApiProperty({
    example: 'Мой первый комментарий',
    description: 'Comment title',
  })
  title: string;

  @Column()
  @ApiProperty({ example: 'Текст комментария', description: 'Comment text' })
  comment: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Created at' })
  createdAt: Date;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  @ApiProperty({ type: () => Post, required: false })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ type: () => User, required: false })
  user: User | null;
}
