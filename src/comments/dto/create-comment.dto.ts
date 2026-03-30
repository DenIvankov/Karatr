import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'Мой первый комментарий',
    description: 'Заголовок комментария',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Текст комментария',
    description: 'Содержимое комментария',
  })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
