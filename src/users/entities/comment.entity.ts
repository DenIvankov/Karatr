import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Post } from './post.entity';
@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;
  @Column()
  comment: string;
  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn()
  post: Post;
}
