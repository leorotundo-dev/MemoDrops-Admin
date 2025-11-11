export type User = {
  id: string;
  name: string;
  email: string;
  plan?: string | null;
  cash?: number;
  is_banned?: boolean;
  last_login_at?: string | null;
};

export type UserActivity = {
  id: string | number;
  action: string;
  created_at: string;
  meta?: Record<string, any>;
};

export type EngagementPoint = {
  date: string;       // YYYY-MM-DD
  cards: number;      // cards estudadas no dia
  minutes?: number;   // minutos estudados (opcional)
};

export type UserStats = {
  decks: number;
  cards: number;
  sessions: number;
  avg_streak: number;
  engagement: EngagementPoint[];
};
