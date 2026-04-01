export type ActivityLevel = 'low' | 'medium' | 'high' | 'very_high';

export type SimulationConfig = {
  enabled: boolean;
  minPostAgeHours: number;
  maxPostAgeHours: number;
  allowLike: boolean;
  allowComment: boolean;
  allowRepost: boolean;
  allowFavorite: boolean;
  participantsMax: number;
  activityLevel: ActivityLevel;
};

export type SimulationStats = {
  totalActions: number;
  totalLikes: number;
  totalComments: number;
  totalReposts: number;
  totalFavorites: number;
  lastTickAt: string | null;
  lastActionAt: string | null;
};

export type SimulationStatus = {
  running: boolean;
  config: SimulationConfig;
  usersCount: number;
  maxParticipantsAllowed: number;
  intervalMs: number;
  stats: SimulationStats;
};
