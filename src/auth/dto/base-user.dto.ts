import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class BaseUserDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'User email',
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    type: String,
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'Ivan',
    description: 'User name',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
