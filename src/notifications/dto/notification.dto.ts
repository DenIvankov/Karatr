import { ApiProperty } from '@nestjs/swagger';
import { Notification, NotificationType } from '../entities/notification.entity';

export class NotificationUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: '/uploads/avatar/abc.jpg', required: false })
  avatar?: string | null;
}

export class NotificationItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiProperty({ example: '2026-03-31T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: 42, required: false, nullable: true })
  postId?: number | null;

  @ApiProperty({ type: () => NotificationUserDto, required: false, nullable: true })
  fromUser?: NotificationUserDto | null;
}

export class NotificationsListDto {
  @ApiProperty({ type: () => [NotificationItemDto] })
  notifications: Notification[];

  @ApiProperty({ example: 20 })
  total: number;
}

export class NotificationsUnreadCountDto {
  @ApiProperty({ example: 3 })
  unreadCount: number;
}
