import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createComment(userId: number, postId: number, commentData: CreateCommentDto) {
    const savedCommentId = await this.commentRepository.manager.transaction(
      async (manager) => {
        const postRepository = manager.getRepository(Post);
        const userRepository = manager.getRepository(User);
        const commentRepository = manager.getRepository(Comment);

        const post = await postRepository.findOne({
          where: { id: postId },
        });

        if (!post) {
          throw new NotFoundException(`Post with id ${postId} not found`);
        }

        const user = await userRepository.findOne({
          where: { id: userId },
        });

        if (!user) {
          throw new NotFoundException(`User with id ${userId} not found`);
        }

        const comment = commentRepository.create({
          ...commentData,
          post,
          user,
        });

        const saved = await commentRepository.save(comment);
        await postRepository.increment({ id: postId }, 'commentsCount', 1);

        return saved.id;
      },
    );

    const fullComment = await this.findCommentById(savedCommentId);

    const postAuthorId = fullComment.post?.user?.id;
    const targetPostId = fullComment.post?.id;
    if (postAuthorId && targetPostId) {
      await this.notificationsService.createNotification({
        userId: postAuthorId,
        fromUserId: userId,
        postId: targetPostId,
        type: NotificationType.COMMENT,
      });
    }

    return {
      comment: fullComment,
      message: 'Comment created successfully',
    };
  }

  async findCommentById(commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: {
        post: {
          user: true,
        },
        user: {
          profile: true,
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    return comment;
  }

  async findCommentsByPostId(postId: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }

    const comments = await this.commentRepository.find({
      where: { post: { id: postId } },
      relations: {
        user: {
          profile: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      comments,
      total: comments.length,
    };
  }

  async updateComment(commentId: number, userId: number, updateData: UpdateCommentDto) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: {
        user: true,
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    if (!comment.user || comment.user.id !== userId) {
      throw new ForbiddenException('You can edit only your own comment');
    }

    if (typeof updateData.title === 'string') {
      comment.title = updateData.title;
    }

    if (typeof updateData.comment === 'string') {
      comment.comment = updateData.comment;
    }

    await this.commentRepository.save(comment);

    return {
      comment: await this.findCommentById(commentId),
      message: 'Comment updated successfully',
    };
  }

  async deleteComment(commentId: number, userId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: {
        user: true,
        post: true,
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    if (!comment.user || comment.user.id !== userId) {
      throw new ForbiddenException('You can delete only your own comment');
    }

    await this.commentRepository.manager.transaction(async (manager) => {
      const commentRepository = manager.getRepository(Comment);
      const postRepository = manager.getRepository(Post);

      await commentRepository.delete(commentId);

      await postRepository
        .createQueryBuilder()
        .update(Post)
        .set({
          commentsCount: () => 'GREATEST(comments_count - 1, 0)',
        })
        .where('id = :postId', { postId: comment.post.id })
        .execute();
    });

    return {
      message: `Comment with id ${commentId} deleted`,
    };
  }
}
