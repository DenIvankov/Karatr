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
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { UserResponseDto, UsersListDto } from './dto/user-response.dto';
import { SuccessMessageDto } from 'src/common/dto/success-message.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Создать пользователя' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get()
  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: UsersListDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  AllUsers() {
    return this.usersService.findAll();
  }

  @Get('id/:id')
  @ApiOperation({ summary: 'Получить пользователя по id' })
  @ApiParam({ name: 'id', example: 1, description: 'User identifier' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(+id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Получить пользователя по имени' })
  @ApiParam({ name: 'name', example: 'Пётр', description: 'User name' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOneByName(@Param('name') name: string) {
    return this.usersService.findOneByName(name);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiParam({ name: 'id', example: 1, description: 'User identifier' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: SuccessMessageDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('userName') userNameFromParams: string) {
    return this.usersService.removeByName(userNameFromParams);
  }

  @Delete('id/:id')
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiParam({ name: 'id', example: 1, description: 'User identifier' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: SuccessMessageDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  removeId(@Param('id') id: string) {
    return this.usersService.delete(+id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all users' })
  @ApiResponse({
    status: 200,
    description: 'All users deleted successfully',
    type: SuccessMessageDto,
  })
  deleteAll() {
    return this.usersService.deleteAll();
  }
}
