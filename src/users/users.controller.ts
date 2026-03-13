import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { User } from 'src/common/user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Создать пользователя' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @Post('all')
  @ApiOperation({ summary: 'Создать пост' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  createPost(@User('userId') userId: number, @Body() post: CreatePostDto) {
    return this.usersService.createPost(userId, post);
  }
  @Post('all/:id')
  @ApiOperation({ summary: 'Создать комментарии' })
  createComment(
    @Body() comment: CreateCommentDto,
    @Param('id') postId: number,
  ) {
    return this.usersService.createComment(comment, postId);
  }
  @Post('all/comment/:id')
  @ApiOperation({ summary: 'Добавить лайк' })
  addLike(@User('userId') userId: string, @Param('id') postId: number) {
    return this.usersService.addLike(+userId, postId);
  }
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get()
  @ApiOperation({ summary: 'Получить всех пользователей' })
  AllUsers() {
    return this.usersService.findAll();
  }

  @Get('id/:id')
  @ApiOperation({ summary: 'Получить пользователя по id' })
  @ApiParam({ name: 'id', example: 1, description: 'User identifier' })
  @ApiOkResponse({
    description: 'User returned',
    example: 'This action returns a #1 user',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(+id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Получить пользователя по имени' })
  @ApiParam({ name: 'name', example: 'Пётр', description: 'User name' })
  @ApiOkResponse({
    description: 'User returned',
    example: 'This action returns a #1 user',
  })
  findOneByName(@Param('name') name: string) {
    return this.usersService.findOneByName(name);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiParam({ name: 'id', example: 1, description: 'User identifier' })
  @ApiOkResponse({
    description: 'User updated',
    example: 'This action updates a #1 user',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete('name/:userName')
  @ApiOperation({ summary: 'Delete user by name' })
  @ApiParam({
    name: 'userName',
    example: 'Denis',
    description: 'User name',
  })
  @ApiOkResponse({
    description: 'User deleted',
    example: 'User with name Denis deleted',
  })
  remove(@Param('userName') userNameFromParams: string) {
    return this.usersService.removeByName(userNameFromParams);
  }

  @Delete('id/:id')
  removeId(@Param('id') id: string) {
    return this.usersService.delete(+id);
  }

  @Delete()
  deleteAll() {
    return this.usersService.deleteAll();
  }
}
