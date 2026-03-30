import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional({
    type: [Number],
    description: 'IDs of existing media files to remove',
    example: [2, 3],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const values = Array.isArray(value) ? value : [value];
    return values
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item));
  })
  removeMediaIds?: number[];
}

export class UpdatePostMultipartDto extends UpdatePostDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'New media files to append (max total media per post: 4)',
  })
  media?: unknown[];
}
