export type AdminStats = {
  users: { total: number; new_last_30_days: number; active_dau: number; active_mau: number };
  content: { contests: number; subjects: number; public_decks: number; public_cards: number };
  finance: { mrr: number; total_cost: number; gross_profit: number };
  system: { api_status: string; db_status: string; active_jobs: number; failed_jobs: number };
};
export type UserRow = {
  id: string; email: string; name?: string | null; plan?: string | null; cash_balance?: number | null; created_at?: string; last_login?: string | null;
};
export type ContestRow = { id: string; name: string; banca: string; ano: number; nivel?: string | null; total_subjects?: number | null };
export type SubjectRow = { id: string; name: string; contest_id?: string | null; total_decks?: number | null };
