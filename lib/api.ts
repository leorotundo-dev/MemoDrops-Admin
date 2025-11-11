export async function api(path: string, opts: { token?: string; init?: RequestInit } = {}){
  const base = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const headers = new Headers(opts.init?.headers);
  headers.set('Content-Type', 'application/json');
  if (opts.token) headers.set('Authorization', `Bearer ${opts.token}`);
  const res = await fetch(`${base}${path}`, { ...(opts.init || {}), headers, next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
export async function apiGet(path: string, token?: string){
  return api(path, { token });
}
export async function apiPost(path: string, body: any, token?: string){
  return api(path, { token, init: { method: 'POST', body: JSON.stringify(body) } });
}
export async function apiPut(path: string, body: any, token?: string){
  return api(path, { token, init: { method: 'PUT', body: JSON.stringify(body) } });
}
export async function apiDelete(path: string, token?: string){
  return api(path, { token, init: { method: 'DELETE' } });
}
