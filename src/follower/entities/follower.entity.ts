import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Unique(['followerId', 'followingId'])
@Entity('follower')
export class Follower {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Follower ID' })
  id: number;

  @Column()
  @ApiProperty({ example: 1, description: 'Follower user ID' })
  followerId: number;

  @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  @ApiProperty({ type: () => User, required: false })
  follower: User;

  @Column()
  @ApiProperty({ example: 1, description: 'Following user ID' })
  followingId: number;

  @ManyToOne(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followingId' })
  @ApiProperty({ type: () => User, required: false })
  following: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Created at' })
  createdAt: Date;
}
