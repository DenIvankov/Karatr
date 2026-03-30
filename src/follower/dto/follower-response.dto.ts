import { ApiProperty } from '@nestjs/swagger';
import { Follower } from 'src/follower/entities/follower.entity';

export class FollowerResponseDto {
  @ApiProperty({ description: 'Follower data', type: Follower })
  follower: Follower;

  @ApiProperty({ example: 'Successfully followed', description: 'Success message' })
  message: string;
}

export class FollowersListDto {
  @ApiProperty({ description: 'List of followers', type: [Follower] })
  followers: Follower[];

  @ApiProperty({ example: 10, description: 'Total count' })
  total: number;
}
