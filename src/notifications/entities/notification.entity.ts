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

export enum NotificationType {
  FOLLOW = 'follow',
  LIKE = 'like',
  COMMENT = 'comment',
  REPOST = 'repost',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Notification ID' })
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  @ApiProperty({ example: 2, description: 'Recipient user id' })
  userId: number;

  @Column({ name: 'from_user_id', type: 'int', nullable: true })
  @ApiProperty({
    example: 5,
    description: 'Actor user id',
    required: false,
    nullable: true,
  })
  fromUserId?: number | null;

  @Column({ name: 'post_id', type: 'int', nullable: true })
  @ApiProperty({
    example: 42,
    description: 'Related post id',
    required: false,
    nullable: true,
  })
  postId?: number | null;

  @Column({ type: 'varchar', length: 32 })
  @ApiProperty({ enum: NotificationType, example: NotificationType.LIKE })
  type: NotificationType;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  @ApiProperty({ example: false, description: 'Read state' })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @ApiProperty({ example: '2026-03-31T12:00:00Z', description: 'Created at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ type: () => User, required: false })
  user?: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'from_user_id' })
  @ApiProperty({ type: () => User, required: false, nullable: true })
  fromUser?: User | null;

  @ManyToOne(() => Post, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  @ApiProperty({ type: () => Post, required: false, nullable: true })
  post?: Post | null;
}
