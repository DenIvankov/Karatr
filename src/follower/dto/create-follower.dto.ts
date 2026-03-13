import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
export class CreateFollowerDto {
  @ApiProperty({
    example: '1',
    description: 'Подписаться на пользователя',
  })
  @IsInt()
  @IsNotEmpty()
  following: number;

  @ApiProperty({
    example: '1',
    description: 'Подписать пользователя',
  })
  @IsInt()
  @IsNotEmpty()
  follower: number;
}
