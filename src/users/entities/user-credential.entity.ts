import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_credentials')
export class UserCredential {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  passwordHash: string;

  @OneToOne(() => User, (user) => user.credential, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
