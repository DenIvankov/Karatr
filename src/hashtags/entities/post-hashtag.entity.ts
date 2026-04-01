import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { Hashtag } from './hashtag.entity';

@Entity('post_hashtags')
@Index('idx_post_hashtags_post_hashtag_unique', ['post', 'hashtag'], {
  unique: true,
})
export class PostHashtag {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Post hashtag relation ID' })
  id: number;

  @ManyToOne(() => Post, (post) => post.postHashtags, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'post_id' })
  @ApiProperty({ type: () => Post })
  post: Post;

  @ManyToOne(() => Hashtag, (hashtag) => hashtag.postHashtags, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'hashtag_id' })
  @ApiProperty({ type: () => Hashtag })
  hashtag: Hashtag;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @ApiProperty({
    example: '2026-03-31T12:00:00.000Z',
    description: 'Relation created at',
  })
  createdAt: Date;
}
