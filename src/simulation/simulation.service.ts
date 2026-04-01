import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Repository } from 'typeorm';
import { CommentsService } from 'src/comments/comments.service';
import { PostFavorite } from 'src/posts/entities/post-favorite.entity';
import { PostLike } from 'src/posts/entities/post-like.entity';
import { Post } from 'src/posts/entities/post.entity';
import { PostsService } from 'src/posts/posts.service';
import { User } from 'src/users/entities/user.entity';
import { UpdateSimulationConfigDto } from './dto/update-simulation-config.dto';
import { ActivityLevel, SimulationConfig, SimulationStatus, SimulationStats } from './simulation.types';

type SimulationAction = 'like' | 'comment' | 'repost' | 'favorite';
type EligiblePost = {
  id: number;
  userId: number;
  commentsCount: number;
};

const DEFAULT_CONFIG: SimulationConfig = {
  enabled: false,
  minPostAgeHours: 0,
  maxPostAgeHours: 72,
  allowLike: true,
  allowComment: true,
  allowRepost: true,
  allowFavorite: false,
  participantsMax: 8,
  activityLevel: 'medium',
};

@Injectable()
export class SimulationService implements OnModuleDestroy {
  private readonly logger = new Logger(SimulationService.name);
  private timer: NodeJS.Timeout | null = null;
  private tickInProgress = false;

  private config: SimulationConfig = { ...DEFAULT_CONFIG };
  private stats: SimulationStats = {
    totalActions: 0,
    totalLikes: 0,
    totalComments: 0,
    totalReposts: 0,
    totalFavorites: 0,
    lastTickAt: null,
    lastActionAt: null,
  };
  private readonly commentsBank: string[];

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikesRepository: Repository<PostLike>,
    @InjectRepository(PostFavorite)
    private readonly postFavoritesRepository: Repository<PostFavorite>,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {
    this.commentsBank = this.loadCommentsBank();
  }

  async onModuleDestroy() {
    this.stopScheduler();
  }

  async getStatus(): Promise<SimulationStatus> {
    const usersCount = await this.usersRepository.count();
    const maxParticipantsAllowed = Math.max(0, usersCount - 1);

    return {
      running: Boolean(this.timer),
      config: {
        ...this.config,
        participantsMax: Math.min(this.config.participantsMax, maxParticipantsAllowed),
      },
      usersCount,
      maxParticipantsAllowed,
      intervalMs: this.getTickIntervalMs(this.config.activityLevel),
      stats: { ...this.stats },
    };
  }

  async updateConfig(dto: UpdateSimulationConfigDto) {
    const merged: SimulationConfig = {
      ...this.config,
      ...dto,
    };

    if (merged.minPostAgeHours > merged.maxPostAgeHours) {
      throw new BadRequestException(
        'minPostAgeHours cannot be greater than maxPostAgeHours',
      );
    }

    const usersCount = await this.usersRepository.count();
    const maxParticipantsAllowed = Math.max(0, usersCount - 1);
    merged.participantsMax = Math.max(
      0,
      Math.min(merged.participantsMax, maxParticipantsAllowed),
    );

    this.config = merged;

    if (this.config.enabled) {
      this.startScheduler();
    } else {
      this.stopScheduler();
    }

    return this.getStatus();
  }

  async start() {
    this.config.enabled = true;
    this.startScheduler();
    return this.getStatus();
  }

  async stop() {
    this.config.enabled = false;
    this.stopScheduler();
    return this.getStatus();
  }

  private startScheduler() {
    this.stopScheduler();

    const intervalMs = this.getTickIntervalMs(this.config.activityLevel);
    this.timer = setInterval(() => {
      void this.runTick();
    }, intervalMs);
    this.timer.unref?.();

    this.logger.log(`Simulation started with interval ${intervalMs}ms`);
  }

  private stopScheduler() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
    this.logger.log('Simulation stopped');
  }

  private async runTick() {
    if (!this.config.enabled || this.tickInProgress) return;
    this.tickInProgress = true;
    this.stats.lastTickAt = new Date().toISOString();

    try {
      const posts = await this.findEligiblePosts();
      if (!posts.length) return;

      const candidateActions = this.getEnabledActions();
      if (!candidateActions.length) return;

      const actionsPerTick = this.getActionsPerTick(this.config.activityLevel);
      for (let i = 0; i < actionsPerTick; i += 1) {
        const targetPost = posts[Math.floor(Math.random() * posts.length)];
        const action = this.pickActionForPost(candidateActions, targetPost.commentsCount);
        const performed = await this.performAction(targetPost, action);
        if (performed) {
          this.stats.totalActions += 1;
          this.stats.lastActionAt = new Date().toISOString();
        }
      }
    } catch (error) {
      const err = error as Error;
      this.logger.warn(
        `Simulation tick failed: ${err.message}${err.stack ? `\n${err.stack}` : ''}`,
      );
    } finally {
      this.tickInProgress = false;
    }
  }

  private async findEligiblePosts() {
    const minHours = this.config.minPostAgeHours;
    const maxHours = this.config.maxPostAgeHours;
    const nowMs = Date.now();
    const minCreatedAt = new Date(nowMs - maxHours * 3_600_000);
    const maxCreatedAt = new Date(nowMs - minHours * 3_600_000);

    const rows = await this.postsRepository.query(
      `
      SELECT p.id,
             p."userId" AS "userId",
             p.comments_count AS "commentsCount"
      FROM posts p
      WHERE p.original_post_id IS NULL
        AND p.created_at >= $1
        AND p.created_at <= $2
      ORDER BY p.created_at DESC
      LIMIT 200
      `,
      [minCreatedAt, maxCreatedAt],
    );

    return rows.map((row: { id: number; userId: number; commentsCount: number }) => ({
      id: Number(row.id),
      userId: Number(row.userId),
      commentsCount: Number(row.commentsCount ?? 0),
    })) as EligiblePost[];
  }

  private getEnabledActions(): SimulationAction[] {
    const actions: SimulationAction[] = [];
    if (this.config.allowLike) actions.push('like');
    if (this.config.allowComment) actions.push('comment');
    if (this.config.allowRepost) actions.push('repost');
    if (this.config.allowFavorite) actions.push('favorite');
    return actions;
  }

  private pickActionForPost(
    candidateActions: SimulationAction[],
    commentsCount: number,
  ): SimulationAction {
    if (!candidateActions.length) {
      return 'like';
    }

    if (commentsCount > 0 && candidateActions.includes('comment')) {
      const roll = Math.random();
      if (roll < 0.45) return 'comment';
    }

    return candidateActions[Math.floor(Math.random() * candidateActions.length)];
  }

  private async performAction(post: EligiblePost, action: SimulationAction) {
    const actorId = await this.pickActorId(post.userId, post.commentsCount);
    if (!actorId) return false;

    if (action === 'like') {
      return this.performLike(post.id, actorId);
    }
    if (action === 'favorite') {
      return this.performFavorite(post.id, actorId);
    }
    if (action === 'repost') {
      return this.performRepost(post.id, actorId);
    }
    return this.performComment(post.id, actorId);
  }

  private async pickActorId(authorId: number, commentsCount: number) {
    const users = await this.usersRepository.find({
      select: ['id'],
    });
    const pool = users
      .map((user) => user.id)
      .filter((id) => id && id !== authorId);

    if (!pool.length) return null;

    const baseLimit = Math.max(0, Math.min(this.config.participantsMax, pool.length));
    if (baseLimit === 0) return null;

    const extra = commentsCount > 0 ? 2 : 0;
    const effectiveLimit = Math.min(pool.length, baseLimit + extra);
    const pickedPoolSize = this.randomInt(1, effectiveLimit);
    const pickedPool = this.shuffle(pool).slice(0, pickedPoolSize);
    return pickedPool[Math.floor(Math.random() * pickedPool.length)] ?? null;
  }

  private async performLike(postId: number, actorId: number) {
    const existing = await this.postLikesRepository
      .createQueryBuilder('pl')
      .select('pl.id', 'id')
      .where('pl.post_id = :postId', { postId })
      .andWhere('pl.user_id = :actorId', { actorId })
      .limit(1)
      .getRawOne();
    if (existing) return false;

    await this.postsService.toggleLike(actorId, postId);
    this.stats.totalLikes += 1;
    return true;
  }

  private async performFavorite(postId: number, actorId: number) {
    const existing = await this.postFavoritesRepository
      .createQueryBuilder('pf')
      .select('pf.id', 'id')
      .where('pf.post_id = :postId', { postId })
      .andWhere('pf.user_id = :actorId', { actorId })
      .limit(1)
      .getRawOne();
    if (existing) return false;

    await this.postsService.toggleFavorite(actorId, postId);
    this.stats.totalFavorites += 1;
    return true;
  }

  private async performRepost(postId: number, actorId: number) {
    try {
      await this.postsService.repostPost(actorId, postId);
      this.stats.totalReposts += 1;
      return true;
    } catch {
      return false;
    }
  }

  private async performComment(postId: number, actorId: number) {
    const commentText = this.pickCommentText(postId);

    try {
      await this.commentsService.createComment(actorId, postId, {
        title: 'Auto comment',
        comment: commentText,
      });
      this.stats.totalComments += 1;
      return true;
    } catch {
      return false;
    }
  }

  private pickCommentText(_postId: number) {
    return (
      this.commentsBank[Math.floor(Math.random() * this.commentsBank.length)] ??
      'Interesting post'
    );
  }

  private getTickIntervalMs(level: ActivityLevel) {
    if (level === 'low') return 120_000;
    if (level === 'medium') return 60_000;
    if (level === 'high') return 30_000;
    return 15_000;
  }

  private getActionsPerTick(level: ActivityLevel) {
    if (level === 'low') return 1;
    if (level === 'medium') return 2;
    if (level === 'high') return 4;
    return 6;
  }

  private loadCommentsBank() {
    const fromFile = this.tryLoadCommentsFile();
    if (fromFile.length >= 200) return fromFile;

    const fallback = [...fromFile];
    while (fallback.length < 200) {
      fallback.push(`Great point ${fallback.length + 1}`);
    }
    return fallback;
  }

  private tryLoadCommentsFile() {
    const candidates = [
      resolve(process.cwd(), 'seed-data', 'simulation', 'comments-bank.json'),
      resolve(process.cwd(), '..', 'seed-data', 'simulation', 'comments-bank.json'),
    ];

    for (const path of candidates) {
      try {
        const raw = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) continue;
        const cleaned = parsed
          .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
          .map((entry) => entry.replace(/\s*№\d+\s*$/u, '').trim())
          .filter((entry) => Boolean(entry));
        if (cleaned.length) return cleaned;
      } catch {
        // noop
      }
    }

    return [];
  }

  private shuffle<T>(items: T[]) {
    const next = [...items];
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
  }

  private randomInt(min: number, max: number) {
    if (max <= min) return min;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
