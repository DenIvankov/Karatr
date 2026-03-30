import { ApiProperty } from '@nestjs/swagger';
import { Post } from 'src/posts/entities/post.entity';
import { PostMediaType } from 'src/posts/entities/post-media.entity';

export class MediaItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: PostMediaType, example: PostMediaType.IMAGE })
  type: PostMediaType;

  @ApiProperty({ example: '/uploads/posts/123/1717254-cat.webp' })
  url: string;

  @ApiProperty({ example: 'image/webp' })
  mimeType: string;

  @ApiProperty({ example: 120431 })
  size: number;

  @ApiProperty({ example: 0 })
  order: number;
}

export class PostResponseDto {
  @ApiProperty({ description: 'Post data', type: Post })
  post: Post;

  @ApiProperty({ example: 'Post created successfully', description: 'Success message' })
  message: string;
}

export class PostsListDto {
  @ApiProperty({ description: 'List of posts', type: [Post] })
  posts: Post[];

  @ApiProperty({ example: 10, description: 'Total count' })
  total: number;
}
