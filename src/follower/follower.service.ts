import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFollowerDto } from './dto/create-follower.dto';
import { UpdateFollowerDto } from './dto/update-follower.dto';
import { Follower } from './entities/follower.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FollowerService {
  constructor(
    @InjectRepository(Follower)
    private readonly followerRepository: Repository<Follower>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async follow(createFollowerDto: CreateFollowerDto) {
    const { following, follower } = createFollowerDto;
    if (follower === following) {
      throw new ConflictException('Нельзя подписаться на самого себя');
    }
    const followerUser = await this.userRepository.findOne({
      where: { id: follower },
    });

    if (!followerUser) {
      throw new NotFoundException(
        `Пользователь follower с id ${follower} не найден`,
      );
    }
    const followingUser = await this.userRepository.findOne({
      where: { id: following },
    });
    if (!followingUser) {
      throw new NotFoundException(
        `Пользователь following с id ${following} не найден`,
      );
    }
    const followerExists = await this.followerRepository.findOne({
      where: {
        follower: { id: follower },
        following: { id: following },
      },
      relations: {
        follower: true,
        following: true,
      },
    });

    if (followerExists) {
      throw new ConflictException('Подписка уже существует');
    }
    const newFollow = this.followerRepository.create({
      follower: followerUser,
      following: followingUser,
    });
    await this.followerRepository.save(newFollow);
    return `Пользователь ${followerUser.name} подписался на пользователя ${followingUser.name}`;
  }
  async unfollow(createFollowerDto: CreateFollowerDto) {
    const { following, follower } = createFollowerDto;
    const followerExists = await this.followerRepository.findOne({
      where: {
        follower: { id: follower },
        following: { id: following },
      },
      relations: {
        follower: true,
        following: true,
      },
    });
    if (!followerExists) {
      throw new NotFoundException('Подписка не найдена');
    }
    await this.followerRepository.delete(followerExists.id);
    return `Пользователь ${followerExists.follower.name} отписался от пользователя ${followerExists.following.name}`;
  }
  async getFollowers(userId: number) {
    const followers = await this.followerRepository.find({
      where: { following: { id: userId } },
      relations: {
        follower: true,
      },
    });
    return followers.map((follower) => follower.follower);
  }
  async getFollowing(userId: number) {
    const following = await this.followerRepository.find({
      where: { follower: { id: userId } },
      relations: {
        following: true,
      },
    });
    return following.map((follower) => follower.following);
  }
  findAll() {
    return `This action returns all follower`;
  }

  findOne(id: number) {
    return `This action returns a #${id} follower`;
  }

  update(id: number, updateFollowerDto: UpdateFollowerDto) {
    return `This action updates a #${id} follower`;
  }

  remove(id: number) {
    return `This action removes a #${id} follower`;
  }
}
