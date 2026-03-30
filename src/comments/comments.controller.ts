import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { User } from 'src/common/user.decorator';
import { SuccessMessageDto } from 'src/common/dto/success-message.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto, CommentsListDto } from './dto/comment-response.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsService } from './comments.service';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('post/:postId')
  @ApiOperation({ summary: 'Create comment for post' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiParam({ name: 'postId', example: 1, description: 'Post identifier' })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  createComment(
    @User('userId') userId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() comment: CreateCommentDto,
  ) {
    return this.commentsService.createComment(userId, postId, comment);
  }

  @Get('post/:postId')
  @ApiOperation({ summary: 'Get comments by post id' })
  @ApiParam({ name: 'postId', example: 1, description: 'Post identifier' })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: CommentsListDto,
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findCommentsByPostId(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentsService.findCommentsByPostId(postId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comment by id' })
  @ApiParam({ name: 'id', example: 1, description: 'Comment identifier' })
  @ApiResponse({
    status: 200,
    description: 'Comment retrieved successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findCommentById(@Param('id', ParseIntPipe) commentId: number) {
    const comment = await this.commentsService.findCommentById(commentId);

    return {
      comment,
      message: 'Comment retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update comment' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiParam({ name: 'id', example: 1, description: 'Comment identifier' })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  updateComment(
    @Param('id', ParseIntPipe) commentId: number,
    @User('userId') userId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(commentId, userId, updateCommentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete comment' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiParam({ name: 'id', example: 1, description: 'Comment identifier' })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
    type: SuccessMessageDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  deleteComment(
    @Param('id', ParseIntPipe) commentId: number,
    @User('userId') userId: number,
  ) {
    return this.commentsService.deleteComment(commentId, userId);
  }
}
