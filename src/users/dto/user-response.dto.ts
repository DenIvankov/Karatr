import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ description: 'User data', type: User })
  user: User;
}

export class UsersListDto {
  @ApiProperty({ description: 'List of users', type: [User] })
  users: User[];

  @ApiProperty({ example: 10, description: 'Total count' })
  total: number;
}
