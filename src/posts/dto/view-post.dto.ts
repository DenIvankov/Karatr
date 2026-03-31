import { ApiProperty } from '@nestjs/swagger';

export class ViewPostResponseDto {
  @ApiProperty({ example: 1, description: 'Post identifier' })
  postId: number;

  @ApiProperty({ example: 146, description: 'Updated views count' })
  viewsCount: number;

  @ApiProperty({
    example: 'View counted successfully',
    description: 'Success message',
  })
  message: string;
}
