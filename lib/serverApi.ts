import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://api.memodrops.com";

export async function sfetch(path: string, init: RequestInit = {}) {
  const session = await getServerSession(authOptions as any);
  const headers = new Headers(init.headers || {});
  const token = (session as any)?.token || (session as any)?.user?.token;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_URL}${path}`, { ...init, headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${path} ${res.status}`);
  return res.json();
}
