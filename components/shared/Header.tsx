'use client';
import Link from "next/link";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";

export default function Header({ title }: { title: string }) {
  const { setTheme, theme } = useTheme();
  const { data } = useSession();
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="container flex items-center justify-between h-14">
        <h1 className="text-sm font-semibold">{title}</h1>
        <div className="flex items-center gap-3">
          <button className="btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            Tema
          </button>
          <div className="text-sm text-slate-600 hidden sm:block">
            {data?.user?.name || data?.user?.email}
          </div>
          <button className="btn" onClick={() => signOut({ callbackUrl: '/login' })}>Sair</button>
        </div>
      </div>
    </header>
  );
}
