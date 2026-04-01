import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

type CreateNotificationInput = {
  userId: number;
  fromUserId?: number | null;
  postId?: number | null;
  type: NotificationType;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async createNotification(input: CreateNotificationInput) {
    if (input.fromUserId && input.userId === input.fromUserId) {
      return null;
    }

    const row = this.notificationsRepository.create({
      userId: input.userId,
      fromUserId: input.fromUserId ?? null,
      postId: input.postId ?? null,
      type: input.type,
      isRead: false,
    });

    return this.notificationsRepository.save(row);
  }

  async getNotifications(userId: number) {
    const notifications = await this.notificationsRepository.find({
      where: { userId },
      relations: {
        fromUser: { profile: true },
      },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return {
      notifications,
      total: notifications.length,
    };
  }

  async getUnreadCount(userId: number) {
    const unreadCount = await this.notificationsRepository.count({
      where: { userId, isRead: false },
    });

    return { unreadCount };
  }

  async markAllRead(userId: number) {
    await this.notificationsRepository.update({ userId, isRead: false }, { isRead: true });
    return { message: 'Notifications marked as read' };
  }

  async markRead(userId: number, notificationId: number) {
    await this.notificationsRepository.update(
      { id: notificationId, userId, isRead: false },
      { isRead: true },
    );

    return { message: 'Notification marked as read' };
  }
}
