import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

export enum PostMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('post_media')
export class PostMedia {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Media ID' })
  id: number;

  @ManyToOne(() => Post, (post) => post.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({
    type: 'enum',
    enum: PostMediaType,
  })
  @ApiProperty({ enum: PostMediaType, description: 'Media type' })
  type: PostMediaType;

  @Column()
  @ApiProperty({
    example: '/uploads/posts/123/photo.webp',
    description: 'Relative media URL',
  })
  url: string;

  @Column({ name: 'mime_type' })
  @ApiProperty({ example: 'image/webp', description: 'MIME type' })
  mimeType: string;

  @Column({ type: 'bigint' })
  @ApiProperty({ example: 1245123, description: 'File size in bytes' })
  size: number;

  @Column({ name: 'sort_order', default: 0 })
  @ApiProperty({ example: 0, description: 'Display order' })
  order: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Created at' })
  createdAt: Date;
}
