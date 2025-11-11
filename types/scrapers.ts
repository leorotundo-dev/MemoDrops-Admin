export type Scraper = {
  id: string;
  name: string;
  display_name: string;
  category: 'banca'|'federal'|'estadual'|'justica'|'municipal'|'outros';
  hostname_pattern: string;
  adapter_file: string;
  is_active: boolean;
  priority: number;
  description?: string;
  test_url?: string;
  last_tested_at?: string | null;
  last_test_success?: boolean | null;
  total_tests?: number;
  successful_tests?: number;
};
export type ScraperLog = {
  id: string;
  url: string;
  status: 'success'|'error'|'timeout';
  materias_found: number;
  error_message?: string | null;
  execution_time: number;
  created_at: string;
};
