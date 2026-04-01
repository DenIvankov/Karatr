import { ApiProperty } from '@nestjs/swagger';

export class SimulationConfigDto {
  @ApiProperty({ example: false })
  enabled: boolean;

  @ApiProperty({ example: 0 })
  minPostAgeHours: number;

  @ApiProperty({ example: 72 })
  maxPostAgeHours: number;

  @ApiProperty({ example: true })
  allowLike: boolean;

  @ApiProperty({ example: true })
  allowComment: boolean;

  @ApiProperty({ example: true })
  allowRepost: boolean;

  @ApiProperty({ example: false })
  allowFavorite: boolean;

  @ApiProperty({ example: 8 })
  participantsMax: number;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'very_high'] })
  activityLevel: 'low' | 'medium' | 'high' | 'very_high';
}

export class SimulationStatsDto {
  @ApiProperty({ example: 42 })
  totalActions: number;

  @ApiProperty({ example: 16 })
  totalLikes: number;

  @ApiProperty({ example: 14 })
  totalComments: number;

  @ApiProperty({ example: 8 })
  totalReposts: number;

  @ApiProperty({ example: 4 })
  totalFavorites: number;

  @ApiProperty({ example: '2026-03-31T12:10:00.000Z', nullable: true })
  lastTickAt: string | null;

  @ApiProperty({ example: '2026-03-31T12:10:12.000Z', nullable: true })
  lastActionAt: string | null;
}

export class SimulationStatusDto {
  @ApiProperty({ example: false })
  running: boolean;

  @ApiProperty({ type: () => SimulationConfigDto })
  config: SimulationConfigDto;

  @ApiProperty({ example: 55 })
  usersCount: number;

  @ApiProperty({ example: 54 })
  maxParticipantsAllowed: number;

  @ApiProperty({ example: 60000 })
  intervalMs: number;

  @ApiProperty({ type: () => SimulationStatsDto })
  stats: SimulationStatsDto;
}
