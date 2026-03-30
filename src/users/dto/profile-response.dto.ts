import { ApiProperty } from '@nestjs/swagger';
import { UserProfile } from 'src/users/entities/user-profile.entity';

export class ProfileResponseDto {
  @ApiProperty({ description: 'Profile data', type: UserProfile })
  profile: UserProfile;

  @ApiProperty({
    example: 'Profile created successfully',
    description: 'Success message',
  })
  message: string;
}

export class ProfileDto {
  @ApiProperty({ description: 'Profile data', type: UserProfile })
  profile: UserProfile;
}
