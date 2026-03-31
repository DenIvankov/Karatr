import { ApiProperty } from '@nestjs/swagger';

export class FollowerResponseDto {
  @ApiProperty({ example: 'Successfully followed', description: 'Success message' })
  message: string;
}

export class FollowerUserListItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Ivan' })
  name: string;

  @ApiProperty({ example: 'ivan@example.com' })
  email: string;

  @ApiProperty({
    example: 'http://localhost:3000/uploads/avatar/abc.jpg',
    nullable: true,
  })
  avatar: string | null;

  @ApiProperty({ example: 'About me', nullable: true })
  bio: string | null;

  @ApiProperty({ example: true })
  isFollowing: boolean;
}

export class FollowersListDto {
  @ApiProperty({ description: 'Users list', type: [FollowerUserListItemDto] })
  users: FollowerUserListItemDto[];

  @ApiProperty({ example: 10, description: 'Total count' })
  total: number;
}
