import { Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { SuccessMessageDto } from 'src/common/dto/success-message.dto';
import { User } from 'src/common/user.decorator';
import {
  NotificationsListDto,
  NotificationsUnreadCountDto,
} from './dto/notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({
    status: 200,
    description: 'Notifications list',
    type: NotificationsListDto,
  })
  findMine(@User('userId') userId: number) {
    return this.notificationsService.getNotifications(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({
    status: 200,
    description: 'Unread notifications count',
    type: NotificationsUnreadCountDto,
  })
  getUnreadCount(@User('userId') userId: number) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all current user notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'Notifications marked as read',
    type: SuccessMessageDto,
  })
  markAllRead(@User('userId') userId: number) {
    return this.notificationsService.markAllRead(userId);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark one notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    type: SuccessMessageDto,
  })
  markRead(
    @User('userId') userId: number,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    return this.notificationsService.markRead(userId, notificationId);
  }
}
