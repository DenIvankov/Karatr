import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostHashtag } from './post-hashtag.entity';

@Entity('hashtags')
export class Hashtag {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Hashtag ID' })
  id: number;

  @Column({ unique: true, length: 64 })
  @Index('idx_hashtags_name_unique', { unique: true })
  @ApiProperty({ example: 'ai', description: 'Normalized hashtag name' })
  name: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @ApiProperty({ example: '2026-03-31T12:00:00.000Z', description: 'Created at' })
  createdAt: Date;

  @OneToMany(() => PostHashtag, (postHashtag) => postHashtag.hashtag)
  @ApiProperty({ type: () => [PostHashtag], required: false })
  postHashtags?: PostHashtag[];
}
