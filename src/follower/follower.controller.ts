import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FollowerService } from './follower.service';
import { CreateFollowerDto } from './dto/create-follower.dto';
import { UpdateFollowerDto } from './dto/update-follower.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  FollowerResponseDto,
  FollowersListDto,
} from './dto/follower-response.dto';
import { SuccessMessageDto } from 'src/common/dto/success-message.dto';

@Controller('follower')
export class FollowerController {
  constructor(private readonly followerService: FollowerService) {}

  @Post()
  @ApiOperation({ summary: 'Подписаться' })
  @ApiResponse({
    status: 201,
    description: 'Successfully followed',
    type: FollowerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Already following' })
  create(@Body() createFollowerDto: CreateFollowerDto) {
    return this.followerService.follow(createFollowerDto);
  }

  @Post('unfollow')
  @ApiOperation({ summary: 'Отписаться' })
  @ApiResponse({
    status: 200,
    description: 'Successfully unfollowed',
    type: SuccessMessageDto,
  })
  @ApiResponse({ status: 404, description: 'Follow relationship not found' })
  unfollow(@Body() createFollowerDto: CreateFollowerDto) {
    return this.followerService.unfollow(createFollowerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все подписки' })
  @ApiResponse({
    status: 200,
    description: 'Followers retrieved successfully',
    type: FollowersListDto,
  })
  findAll() {
    return this.followerService.findAll();
  }

  @Get('followers/:id')
  @ApiOperation({ summary: 'Получить подписчиков' })
  @ApiResponse({
    status: 200,
    description: 'Followers retrieved successfully',
    type: FollowersListDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  getFollowers(@Param('id') id: string) {
    return this.followerService.getFollowers(+id);
  }

  @Get('following/:id')
  @ApiOperation({ summary: 'Получить подписанных' })
  @ApiResponse({
    status: 200,
    description: 'Following retrieved successfully',
    type: FollowersListDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  getFollowing(@Param('id') id: string) {
    return this.followerService.getFollowing(+id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить подписку по ID' })
  @ApiResponse({
    status: 200,
    description: 'Follower retrieved successfully',
    type: FollowerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Follower not found' })
  findOne(@Param('id') id: string) {
    return this.followerService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить подписку' })
  @ApiResponse({
    status: 200,
    description: 'Follower updated successfully',
    type: FollowerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Follower not found' })
  update(
    @Param('id') id: string,
    @Body() updateFollowerDto: UpdateFollowerDto,
  ) {
    return this.followerService.update(+id, updateFollowerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить подписку' })
  @ApiResponse({
    status: 200,
    description: 'Follower deleted successfully',
    type: SuccessMessageDto,
  })
  @ApiResponse({ status: 404, description: 'Follower not found' })
  remove(@Param('id') id: string) {
    return this.followerService.remove(+id);
  }
}
