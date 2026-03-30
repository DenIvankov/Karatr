import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'Мой первый пост',
    description: 'Заголовок поста',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Текст поста',
    description: 'Содержимое поста',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreatePostMultipartDto extends CreatePostDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Media files (max 4): jpg/jpeg/png/webp/mp4/webm/mov',
  })
  media?: unknown[];
}
