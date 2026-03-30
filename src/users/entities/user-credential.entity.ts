import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 1, description: 'Credential ID' })
  id: number;

  @Column()
  @ApiProperty({ example: '$2b$10$...', description: 'Password hash' })
  passwordHash: string;

  @OneToOne(() => User, (user) => user.credential, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ type: () => User, required: false })
  user: User;
}
