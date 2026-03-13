import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { UserCredential } from './entities/user-credential.entity';
import { UserProfile } from './entities/user-profile.entity';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { PostLike } from './entities/postLike.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCredential)
    private readonly credentialRepository: Repository<UserCredential>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(PostLike)
    private readonly postLikesRepository: Repository<PostLike>,
  ) {}

  async create(newUser: CreateUserDto): Promise<User> {
    await this.ensureEmailIsAvailable(newUser.email);

    const { password, ...userData } = newUser;

    const user = await this.userRepository.save(
      this.userRepository.create({
        ...userData,
        phone: '',
      }),
    );

    const passwordHash = await bcrypt.hash(password, 10);
    await this.credentialRepository.save(
      this.credentialRepository.create({
        passwordHash,
        user,
      }),
    );

    await this.profileRepository.save(
      this.profileRepository.create({
        user,
      }),
    );

    return user;
  }

  async findOneByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findOneById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не существует`);
    }

    return user;
  }

  async findOneByName(name: string) {
    const user = await this.userRepository.findOne({
      where: { name },
    });

    if (!user) {
      throw new NotFoundException(
        `Пользователь с именем ${name} не существует`,
      );
    }

    return user;
  }

  async findCredentialByUserId(userId: number) {
    return this.credentialRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });
  }

  async findRefreshTokenByUserId(userId: number) {
    return this.refreshTokenRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
      order: { id: 'DESC' },
    });
  }
  async createPost(userId: number, postData: CreatePostDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const post = this.postRepository.create({
      ...postData,
      user,
    });

    return this.postRepository.save(post);
  }
  async createComment(commentData: CreateCommentDto, postId: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }

    const comment = this.commentRepository.create({
      ...commentData,
      post,
    });

    return this.commentRepository.save(comment);
  }
  async addLike(userId: number, postId: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Пост с номером id ${postId} не существует`);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        `Пользователь с номером id ${userId} не существует`,
      );
    }

    const existingLike = await this.postLikesRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (existingLike) {
      return this.postLikesRepository.delete(existingLike.id);
    }

    return this.postLikesRepository.save({
      post,
      user,
    });
  }

  async updateRefreshToken(userId: number, tokenHash: string, expiresAt: Date) {
    const user = await this.findOneById(userId);
    const existingToken = await this.findRefreshTokenByUserId(userId);

    if (existingToken) {
      existingToken.tokenHash = tokenHash;
      existingToken.expiresAt = expiresAt;

      return this.refreshTokenRepository.save(existingToken);
    }

    return this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        tokenHash,
        expiresAt,
        user,
      }),
    );
  }

  async removeRefreshToken(userId: number) {
    const refreshToken = await this.findRefreshTokenByUserId(userId);

    if (!refreshToken) {
      return { affected: 0 };
    }

    return this.refreshTokenRepository.delete(refreshToken.id);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async delete(id: number): Promise<{ message: string }> {
    const result = await this.userRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return { message: `Пользователь с id ${id} удален` };
  }

  async deleteAll(): Promise<{ message: string }> {
    const result = await this.userRepository.count();

    if (!result) {
      throw new NotFoundException(`Users not found`);
    }

    await this.userRepository.clear();

    return { message: `All users deleted` };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password, ...userData } = updateUserDto;

    if (userData.email) {
      await this.ensureEmailIsAvailable(userData.email, id);
    }

    if (Object.keys(userData).length) {
      const result = await this.userRepository.update(id, userData);

      if (!result.affected) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
    } else {
      await this.findOneById(id);
    }

    if (password) {
      const credential = await this.findCredentialByUserId(id);

      if (!credential) {
        throw new NotFoundException(
          `Credentials for user with id ${id} not found`,
        );
      }

      credential.passwordHash = await bcrypt.hash(password, 10);
      await this.credentialRepository.save(credential);
    }

    return `This action updates a #${id} user`;
  }

  async removeByName(nameToDelete: string) {
    const result = await this.userRepository.delete({
      name: nameToDelete,
    });

    if (!result.affected) {
      throw new NotFoundException(`User with name ${nameToDelete} not found`);
    }

    return { message: `User with name ${nameToDelete} deleted` };
  }

  private async ensureEmailIsAvailable(email: string, excludeUserId?: number) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser && existingUser.id !== excludeUserId) {
      throw new ConflictException(`User with email ${email} already exists`);
    }
  }
}
