import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync } from 'fs';
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'fs';
import { extname, join, resolve } from 'path';
import { In, Repository } from 'typeorm';
import { UPLOADS_DIR } from 'src/common/uploads-path';
import { PostMedia, PostMediaType } from './entities/post-media.entity';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { HashtagsService } from 'src/hashtags/hashtags.service';
import { Hashtag } from 'src/hashtags/entities/hashtag.entity';
import { PostHashtag } from 'src/hashtags/entities/post-hashtag.entity';

type SeedPostItem = {
  number: number;
  title: string;
  content: string;
  mediaFile?: string | null;
};

@Injectable()
export class PostsSeedService implements OnModuleInit {
  private readonly logger = new Logger(PostsSeedService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostMedia)
    private readonly postMediaRepository: Repository<PostMedia>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Hashtag)
    private readonly hashtagsRepository: Repository<Hashtag>,
    @InjectRepository(PostHashtag)
    private readonly postHashtagsRepository: Repository<PostHashtag>,
    private readonly hashtagsService: HashtagsService,
  ) {}

  async onModuleInit() {
    const enabledRaw = process.env.POSTS_SEED_ENABLED;
    if (
      enabledRaw === 'false' ||
      process.env.DISABLE_POSTS_SEED === 'true'
    ) {
      this.logger.log('Posts auto-seed disabled by env');
      return;
    }

    const postsCount = await this.postsRepository.count();
    if (postsCount > 0) {
      return;
    }

    const seedDir = this.resolveSeedDir();
    if (!seedDir) {
      this.logger.warn('seed-data/posts not found, skip auto posts seed');
      return;
    }

    const postsJsonPath = join(seedDir, 'posts.json');
    if (!existsSync(postsJsonPath)) {
      this.logger.warn('posts.json not found in seed-data/posts, skip seed');
      return;
    }

    const users = await this.usersRepository.find({
      select: ['id'],
      order: { id: 'ASC' },
    });
    if (users.length < 3) {
      this.logger.warn('Not enough users for posts seed');
      return;
    }

    const raw = readFileSync(postsJsonPath, 'utf8');
    const normalizedJson = raw.replace(/^\uFEFF/, '');
    const parsed = JSON.parse(normalizedJson) as SeedPostItem[];
    const seedPosts = parsed.slice(0, 22);
    if (!seedPosts.length) {
      this.logger.warn('posts.json is empty, skip seed');
      return;
    }

    const authorIds = this.buildAuthorIds(
      users.map((u) => u.id),
      seedPosts.length,
    );

    for (let index = 0; index < seedPosts.length; index += 1) {
      const seedPost = seedPosts[index];
      const authorId = authorIds[index];

      const savedPost = await this.postsRepository.save(
        this.postsRepository.create({
          title: seedPost.title || `Post ${seedPost.number}`,
          content: seedPost.content || '',
          user: { id: authorId } as User,
        }),
      );
      await this.syncPostHashtags(savedPost.id, savedPost.content);

      if (seedPost.mediaFile) {
        const sourceMediaPath = join(seedDir, 'media', seedPost.mediaFile);
        if (!existsSync(sourceMediaPath)) {
          continue;
        }

        const postFolder = resolve(
          UPLOADS_DIR,
          'posts',
          String(savedPost.id),
        );
        mkdirSync(postFolder, { recursive: true });

        const fileName = seedPost.mediaFile;
        const destinationPath = join(postFolder, fileName);
        copyFileSync(sourceMediaPath, destinationPath);

        const stat = statSync(destinationPath);
        const ext = extname(fileName).toLowerCase();
        const mediaType = ['.mp4', '.webm', '.mov'].includes(ext)
          ? PostMediaType.VIDEO
          : PostMediaType.IMAGE;
        const mimeType = this.resolveMimeType(ext, mediaType);

        await this.postMediaRepository.save(
          this.postMediaRepository.create({
            post: { id: savedPost.id } as Post,
            type: mediaType,
            url: `/uploads/posts/${savedPost.id}/${fileName}`,
            mimeType,
            size: stat.size,
            order: 0,
          }),
        );
      }
    }

    this.logger.log(`Auto-seeded ${seedPosts.length} posts`);
  }

  private resolveSeedDir() {
    const candidates = [
      resolve(process.cwd(), 'seed-data', 'posts'),
      resolve(process.cwd(), '..', 'seed-data', 'posts'),
      resolve(__dirname, '..', '..', '..', 'seed-data', 'posts'),
      resolve(__dirname, '..', '..', '..', '..', 'seed-data', 'posts'),
    ];

    return candidates.find((path) => existsSync(path));
  }

  private buildAuthorIds(userIds: number[], totalPosts: number) {
    const shuffledUsers = this.shuffle([...userIds]);
    if (shuffledUsers.length >= 20 && totalPosts >= 22) {
      const pool = [
        shuffledUsers[0],
        shuffledUsers[0],
        shuffledUsers[1],
        shuffledUsers[1],
        ...shuffledUsers.slice(2, 20),
      ];

      return this.shuffle(pool).slice(0, totalPosts);
    }

    const fallback: number[] = [];
    fallback.push(shuffledUsers[0], shuffledUsers[0], shuffledUsers[1], shuffledUsers[1]);

    while (fallback.length < totalPosts) {
      fallback.push(shuffledUsers[Math.floor(Math.random() * shuffledUsers.length)]);
    }

    return this.shuffle(fallback).slice(0, totalPosts);
  }

  private shuffle<T>(arr: T[]) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private resolveMimeType(ext: string, mediaType: PostMediaType) {
    if (mediaType === PostMediaType.VIDEO) {
      if (ext === '.mov') return 'video/quicktime';
      if (ext === '.webm') return 'video/webm';
      return 'video/mp4';
    }

    if (ext === '.png') return 'image/png';
    if (ext === '.webp') return 'image/webp';
    return 'image/jpeg';
  }

  private async syncPostHashtags(postId: number, content: string) {
    const hashtagNames = this.hashtagsService.extractHashtags(content);
    if (!hashtagNames.length) {
      return;
    }

    await this.hashtagsRepository
      .createQueryBuilder()
      .insert()
      .into(Hashtag)
      .values(hashtagNames.map((name) => ({ name })))
      .orIgnore()
      .execute();

    const hashtags = await this.hashtagsRepository.find({
      where: { name: In(hashtagNames) },
      select: ['id'],
    });

    if (!hashtags.length) {
      return;
    }

    await this.postHashtagsRepository
      .createQueryBuilder()
      .insert()
      .into(PostHashtag)
      .values(
        hashtags.map((hashtag) => ({
          post: { id: postId } as Post,
          hashtag: { id: hashtag.id } as Hashtag,
        })),
      )
      .orIgnore()
      .execute();
  }
}
