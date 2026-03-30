import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Profile ID' })
  id: number;

  @Column({ nullable: true })
  @ApiProperty({ example: 'Ivan', description: 'First name', required: false })
  first_name: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'Ivanov', description: 'Last name', required: false })
  last_name: string;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({
    example: 'avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  avatar: string | null;

  @Column({ nullable: true })
  @ApiProperty({ example: 'About me', description: 'Bio', required: false })
  bio: string;

  @Column({ nullable: true })
  @ApiProperty({
    example: 'Moscow, Russia',
    description: 'Location',
    required: false,
  })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({
    example: 'background.jpg',
    description: 'Background image URL',
    required: false,
  })
  background: string | null;

  @Column({ nullable: true })
  @ApiProperty({
    example: 'https://example.com',
    description: 'Website URL',
    required: false,
  })
  website: string;

  @Column({ type: 'date', nullable: true })
  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth',
    required: false,
  })
  birth_date: string;

  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ type: () => User, required: false })
  user: User;
}
