import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiPropertyOptional({
    example: 'Мой первый пост',
    description: 'Заголовок поста',
  })
  @IsOptional()
  @IsString()
  title?: string;

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
