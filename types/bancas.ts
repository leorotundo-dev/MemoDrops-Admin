export type Banca = {
  id: string;
  name: string;
  display_name: string;
  short_name?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  description?: string | null;
  areas: string[];
  is_active: boolean;
  scraper_id?: string | null;
  scraper_name?: string | null;
  total_contests: number;
  last_contest_date?: string | null;
};

export type BancaYearStat = {
  year: number;
  total_contests: number;
  total_candidates: number;
};
