import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FollowerService } from './follower.service';
import { CreateFollowerDto } from './dto/create-follower.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FollowersListDto } from './dto/follower-response.dto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { User } from 'src/common/user.decorator';

@ApiTags('Follower')
@Controller('follower')
export class FollowerController {
  constructor(private readonly followerService: FollowerService) {}

  @Post(':id/follow')
  @ApiOperation({ summary: 'Follow user' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiParam({ name: 'id', example: 2, description: 'Target user ID' })
  @ApiResponse({
    status: 201,
    description: 'Followed successfully',
    schema: {
      example: {
        following: true,
        followerId: 1,
        followingId: 2,
      },
    },
  })
  follow(
    @User('userId') userId: number,
    @Param('id', ParseIntPipe) targetUserId: number,
  ) {
    return this.followerService.follow(userId, targetUserId);
  }

  @Delete(':id/follow')
  @ApiOperation({ summary: 'Unfollow user' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiParam({ name: 'id', example: 2, description: 'Target user ID' })
  @ApiResponse({
    status: 200,
    description: 'Unfollowed successfully',
    schema: {
      example: {
        following: false,
        followerId: 1,
        followingId: 2,
      },
    },
  })
  unfollow(
    @User('userId') userId: number,
    @Param('id', ParseIntPipe) targetUserId: number,
  ) {
    return this.followerService.unfollow(userId, targetUserId);
  }

  @Get(':id/is-following')
  @ApiOperation({ summary: 'Check if current user follows target user' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiParam({ name: 'id', example: 2, description: 'Target user ID' })
  @ApiResponse({
    status: 200,
    description: 'Following status',
    schema: {
      example: {
        isFollowing: true,
        followerId: 1,
        followingId: 2,
      },
    },
  })
  isFollowing(
    @User('userId') userId: number,
    @Param('id', ParseIntPipe) targetUserId: number,
  ) {
    return this.followerService.isFollowing(userId, targetUserId);
  }

  // Legacy body-based endpoint compatibility
  @Post()
  @ApiOperation({ summary: 'Follow user (legacy body-based)' })
  create(@Body() createFollowerDto: CreateFollowerDto) {
    return this.followerService.followFromDto(createFollowerDto);
  }

  // Legacy body-based endpoint compatibility
  @Post('unfollow')
  @ApiOperation({ summary: 'Unfollow user (legacy body-based)' })
  unfollowLegacy(@Body() createFollowerDto: CreateFollowerDto) {
    return this.followerService.unfollowFromDto(createFollowerDto);
  }

  @Get(':id/followers')
  @ApiOperation({ summary: 'Get followers by user id' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: 200,
    description: 'Followers retrieved successfully',
    type: FollowersListDto,
  })
  getFollowers(
    @Param('id', ParseIntPipe) id: number,
    @User('userId') currentUserId: number,
  ) {
    return this.followerService.getFollowers(id, currentUserId);
  }

  @Get(':id/following')
  @ApiOperation({ summary: 'Get following by user id' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: 200,
    description: 'Following retrieved successfully',
    type: FollowersListDto,
  })
  getFollowing(
    @Param('id', ParseIntPipe) id: number,
    @User('userId') currentUserId: number,
  ) {
    return this.followerService.getFollowing(id, currentUserId);
  }
}
