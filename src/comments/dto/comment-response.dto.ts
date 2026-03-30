import { ApiProperty } from '@nestjs/swagger';
import { Comment } from 'src/comments/entities/comment.entity';

export class CommentResponseDto {
  @ApiProperty({ description: 'Comment data', type: Comment })
  comment: Comment;

  @ApiProperty({ example: 'Comment created successfully', description: 'Success message' })
  message: string;
}

export class CommentsListDto {
  @ApiProperty({ description: 'List of comments', type: [Comment] })
  comments: Comment[];

  @ApiProperty({ example: 3, description: 'Total count' })
  total: number;
}
