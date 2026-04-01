import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostHashtag } from './entities/post-hashtag.entity';

@Injectable()
export class HashtagsService {
  private static readonly HASHTAG_REGEX = /#([\p{L}\p{N}_]+)/gu;

  constructor(
    @InjectRepository(PostHashtag)
    private readonly postHashtagRepository: Repository<PostHashtag>,
  ) {}

  extractHashtags(text: string): string[] {
    if (!text) {
      return [];
    }

    const matches = text.matchAll(HashtagsService.HASHTAG_REGEX);
    const unique = new Set<string>();

    for (const match of matches) {
      const normalized = String(match[1] ?? '').trim().toLowerCase();
      if (normalized.length > 0) {
        unique.add(normalized);
      }
    }

    return [...unique];
  }

  async getTrending(limit = 10, hours = 6) {
    const rows = await this.postHashtagRepository.query(
      `
      SELECT
        h.id AS "id",
        h.name AS "name",
        COUNT(ph.id)::int AS "postsCount",
        MIN(p.created_at) AS "firstUsedAt",
        ROUND(
          (
            COUNT(ph.id)::numeric
            / (
              EXTRACT(EPOCH FROM (NOW() - MIN(p.created_at))) / 3600
              + 1
            )
          ),
          2
        ) AS "score"
      FROM post_hashtags ph
      INNER JOIN hashtags h ON h.id = ph.hashtag_id
      INNER JOIN posts p ON p.id = ph.post_id
      WHERE p.created_at >= NOW() - make_interval(hours => $1::int)
      GROUP BY h.id, h.name
      ORDER BY "postsCount" DESC, "score" DESC, h.name ASC
      LIMIT $2
      `,
      [hours, limit],
    );

    return {
      items: rows.map(
        (row: {
          id: number | string;
          name: string;
          postsCount: number | string;
          firstUsedAt: string;
          score: number | string;
        }) => ({
          id: Number(row.id),
          name: row.name,
          postsCount: Number(row.postsCount),
          firstUsedAt: row.firstUsedAt,
          score: Number(row.score),
        }),
      ),
      limit,
      hours,
    };
  }
}
