import { ApiProperty } from '@nestjs/swagger';
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
