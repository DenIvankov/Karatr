import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class DeleteProfileImagesDto {
  @ApiProperty({
    example: true,
    description: 'Удалить аватар',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  deleteAvatar?: boolean;

  @ApiProperty({
    example: true,
    description: 'Удалить фон профиля',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  deleteBackground?: boolean;
}
