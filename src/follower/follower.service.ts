import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFollowerDto } from './dto/create-follower.dto';
import { UpdateFollowerDto } from './dto/update-follower.dto';
import { Follower } from './entities/follower.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { FollowerUserListItemDto } from './dto/follower-response.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';

@Injectable()
export class FollowerService {
  constructor(
    @InjectRepository(Follower)
    private readonly followerRepository: Repository<Follower>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async follow(userId: number, targetUserId: number) {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    await this.ensureUserExists(userId);
    await this.ensureUserExists(targetUserId);

    const existingFollow = await this.followerRepository.findOne({
      where: {
        followerId: userId,
        followingId: targetUserId,
      },
    });

    if (existingFollow) {
      throw new ConflictException('Already following');
    }

    await this.followerRepository.save({
      followerId: userId,
      followingId: targetUserId,
    });

    await this.notificationsService.createNotification({
      userId: targetUserId,
      fromUserId: userId,
      type: NotificationType.FOLLOW,
    });

    return {
      following: true,
      followerId: userId,
      followingId: targetUserId,
    };
  }

  async unfollow(userId: number, targetUserId: number) {
    const existingFollow = await this.followerRepository.findOne({
      where: {
        followerId: userId,
        followingId: targetUserId,
      },
    });

    if (!existingFollow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.followerRepository.delete(existingFollow.id);

    return {
      following: false,
      followerId: userId,
      followingId: targetUserId,
    };
  }

  async isFollowing(userId: number, targetUserId: number) {
    const follow = await this.followerRepository.findOne({
      where: {
        followerId: userId,
        followingId: targetUserId,
      },
    });

    return {
      isFollowing: Boolean(follow),
      followerId: userId,
      followingId: targetUserId,
    };
  }

  // Legacy body-based API compatibility
  async followFromDto(createFollowerDto: CreateFollowerDto) {
    return this.follow(createFollowerDto.follower, createFollowerDto.following);
  }

  // Legacy body-based API compatibility
  async unfollowFromDto(createFollowerDto: CreateFollowerDto) {
    return this.unfollow(createFollowerDto.follower, createFollowerDto.following);
  }

  async getFollowers(
    userId: number,
    currentUserId: number,
  ): Promise<{ users: FollowerUserListItemDto[]; total: number }> {
    const followers = await this.followerRepository.find({
      where: { followingId: userId },
      relations: {
        follower: { profile: true },
      },
    });

    const users = followers.map((row) => row.follower);
    const usersWithFollowing = await this.attachIsFollowing(users, currentUserId);

    return {
      users: usersWithFollowing,
      total: usersWithFollowing.length,
    };
  }

  async getFollowing(
    userId: number,
    currentUserId: number,
  ): Promise<{ users: FollowerUserListItemDto[]; total: number }> {
    const following = await this.followerRepository.find({
      where: { followerId: userId },
      relations: {
        following: { profile: true },
      },
    });

    const users = following.map((row) => row.following);
    const usersWithFollowing = await this.attachIsFollowing(users, currentUserId);

    return {
      users: usersWithFollowing,
      total: usersWithFollowing.length,
    };
  }

  findAll() {
    return `This action returns all follower`;
  }

  findOne(id: number) {
    return `This action returns a #${id} follower`;
  }

  update(id: number, _updateFollowerDto: UpdateFollowerDto) {
    return `This action updates a #${id} follower`;
  }

  remove(id: number) {
    return `This action removes a #${id} follower`;
  }

  private async ensureUserExists(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
  }

  private async attachIsFollowing(
    users: User[],
    currentUserId: number,
  ): Promise<FollowerUserListItemDto[]> {
    if (!users.length) {
      return [];
    }

    const targetUserIds = users.map((user) => user.id);
    const currentUserFollows = await this.followerRepository.find({
      where: {
        followerId: currentUserId,
        followingId: In(targetUserIds),
      },
      select: ['followingId'],
    });

    const followingIds = new Set(
      currentUserFollows.map((row) => Number(row.followingId)),
    );

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: this.buildAvatarUrl(user.profile?.avatar),
      bio: user.profile?.bio ?? null,
      isFollowing: followingIds.has(user.id),
    }));
  }

  private buildAvatarUrl(avatar: string | null | undefined): string | null {
    if (!avatar) {
      return null;
    }

    if (/^https?:\/\//i.test(avatar)) {
      return avatar;
    }

    const baseUrl =
      process.env.PUBLIC_BASE_URL ??
      `http://localhost:${Number(process.env.PORT ?? 3000)}`;

    const normalizedPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
    return `${baseUrl}${normalizedPath}`;
  }
}
