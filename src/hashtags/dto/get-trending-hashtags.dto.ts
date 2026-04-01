import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class GetTrendingHashtagsDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'Max amount of hashtags to return',
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;

  @ApiPropertyOptional({
    example: 6,
    description: 'Time window in hours',
    default: 6,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(168)
  hours = 6;
}
