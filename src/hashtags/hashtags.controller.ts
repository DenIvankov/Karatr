import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HashtagsService } from './hashtags.service';
import { GetTrendingHashtagsDto } from './dto/get-trending-hashtags.dto';
import { TrendingHashtagsListDto } from './dto/trending-hashtag.dto';

@ApiTags('Hashtags')
@Controller('hashtags')
export class HashtagsController {
  constructor(private readonly hashtagsService: HashtagsService) {}

  @Get('trending')
  @ApiOperation({ summary: 'Get trending hashtags' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'hours', required: false, example: 6 })
  @ApiResponse({
    status: 200,
    description: 'Trending hashtags fetched successfully',
    type: TrendingHashtagsListDto,
  })
  getTrending(@Query() query: GetTrendingHashtagsDto) {
    return this.hashtagsService.getTrending(query.limit, query.hours);
  }
}
