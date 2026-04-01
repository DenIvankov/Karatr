import { ApiProperty } from '@nestjs/swagger';

export class TrendingHashtagDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'ai' })
  name: string;

  @ApiProperty({ example: 120 })
  postsCount: number;

  @ApiProperty({ example: '2026-03-31T12:00:00.000Z' })
  firstUsedAt: string;

  @ApiProperty({ example: 18.46 })
  score: number;
}

export class TrendingHashtagsListDto {
  @ApiProperty({ type: () => [TrendingHashtagDto] })
  items: TrendingHashtagDto[];

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 6 })
  hours: number;
}
