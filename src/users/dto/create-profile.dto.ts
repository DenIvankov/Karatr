import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    example: 'Ivan',
    description: 'First name',
    required: false,
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty({
    example: 'Ivanov',
    description: 'Last name',
    required: false,
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({
    example: 'avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    example: 'About me',
    description: 'Bio',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    example: 'Moscow, Russia',
    description: 'Location',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: 'background.jpg',
    description: 'Background image URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  background?: string;

  @ApiProperty({
    example: 'https://example.com',
    description: 'Website URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  birth_date?: string;
}
