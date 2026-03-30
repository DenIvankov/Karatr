import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { UserCredential } from './user-credential.entity';
import { UserProfile } from './user-profile.entity';
import { Post } from 'src/posts/entities/post.entity';
import { PostLike } from 'src/posts/entities/post-like.entity';
import { Follower } from 'src/follower/entities/follower.entity';
import { Comment } from 'src/comments/entities/comment.entity';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @Column({ default: 'User' })
  @ApiProperty({ example: 'Ivan', description: 'User name' })
  name: string;

  @Column({ unique: true, default: 'exemple@mail.com' })
  @ApiProperty({ example: 'john@example.com', description: 'User email' })
  email: string;

  @Column()
  @ApiProperty({ example: '+79991234567', description: 'User phone' })
  phone: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  @ApiProperty({ enum: Role, default: Role.USER, description: 'User role' })
  role: Role;

  @OneToOne(() => UserCredential, (credential) => credential.user, {
    cascade: true,
  })
  @ApiProperty({ type: () => UserCredential, required: false })
  credential: UserCredential;

  @OneToOne(() => UserProfile, (profile) => profile.user, {
    cascade: true,
  })
  @ApiProperty({ type: () => UserProfile, required: false })
  profile: UserProfile;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  @ApiProperty({ type: () => [RefreshToken], required: false })
  refreshTokens: RefreshToken[];

  @OneToMany(() => Post, (post) => post.user)
  @ApiProperty({ type: () => [Post], required: false })
  posts: Post[];

  @OneToMany(() => PostLike, (likes) => likes.user)
  @ApiProperty({ type: () => [PostLike], required: false })
  likes: PostLike[];

  @OneToMany(() => Comment, (comment) => comment.user)
  @ApiProperty({ type: () => [Comment], required: false })
  comments: Comment[];

  @OneToMany(() => Follower, (follower) => follower.follower)
  @ApiProperty({ type: () => [Follower], required: false })
  followers: Follower[];

  @OneToMany(() => Follower, (following) => following.following)
  @ApiProperty({ type: () => [Follower], required: false })
  following: Follower[];

  @CreateDateColumn()
  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Created at' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Updated at' })
  updated_at: Date;
}
