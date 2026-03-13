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
import { Post } from './post.entity';
import { PostLike } from './postLike.entity';
import { Follower } from 'src/follower/entities/follower.entity';
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'User' })
  name: string;

  @Column({ unique: true, default: 'exemple@mail.com' })
  email: string;
  @Column()
  phone: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @OneToOne(() => UserCredential, (credential) => credential.user, {
    cascade: true,
  })
  credential: UserCredential;

  @OneToOne(() => UserProfile, (profile) => profile.user, {
    cascade: true,
  })
  profile: UserProfile;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => PostLike, (likes) => likes.user)
  likes: PostLike[];
  @OneToMany(() => Follower, (follower) => follower.follower)
  followers: Follower[];
  @OneToMany(() => Follower, (following) => following.following)
  following: Follower[];
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
