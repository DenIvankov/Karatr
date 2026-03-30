import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { AuthTokensDto } from './auth-tokens.dto';

export class AuthResponseDto {
  @ApiProperty({ description: 'User data', type: User })
  user: User;

  @ApiProperty({ description: 'Tokens', type: AuthTokensDto })
  tokens: AuthTokensDto;
}
