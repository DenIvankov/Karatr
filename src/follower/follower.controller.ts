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
import { ApiOperation } from '@nestjs/swagger';

@Controller('follower')
export class FollowerController {
  constructor(private readonly followerService: FollowerService) {}

  @Post()
  @ApiOperation({ summary: 'Подписаться' })
  create(@Body() createFollowerDto: CreateFollowerDto) {
    return this.followerService.follow(createFollowerDto);
  }
  @Post('unfollow')
  @ApiOperation({ summary: 'Отписаться' })
  unfollow(@Body() createFollowerDto: CreateFollowerDto) {
    return this.followerService.unfollow(createFollowerDto);
  }
  @Get()
  findAll() {
    return this.followerService.findAll();
  }

  @Get('followers/:id')
  @ApiOperation({ summary: 'Получиться подписчиков' })
  getFollowers(@Param('id') id: string) {
    return this.followerService.getFollowers(+id);
  }
  @Get('following/:id')
  @ApiOperation({ summary: 'Получиться подписанных' })
  getFollowing(@Param('id') id: string) {
    return this.followerService.getFollowing(+id);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.followerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFollowerDto: UpdateFollowerDto,
  ) {
    return this.followerService.update(+id, updateFollowerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.followerService.remove(+id);
  }
}
