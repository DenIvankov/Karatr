import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Refresh token ID' })
  id: number;

  @Column({ type: 'text' })
  @ApiProperty({
    example: 'abc123...',
    description: 'Token hash',
    required: false,
  })
  tokenHash: string | null;

  @Column({ type: 'timestamp' })
  @ApiProperty({
    example: '2024-12-31T23:59:59Z',
    description: 'Expiration date',
  })
  expiresAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ type: () => User, required: false })
  user: User;
}
