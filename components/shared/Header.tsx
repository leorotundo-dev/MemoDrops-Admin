'use client';
import Link from "next/link";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export default function Header({ title, onMenuToggle }: HeaderProps) {
  const { setTheme, theme } = useTheme();
  const { data } = useSession();
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          {/* Botão hambúrguer apenas no mobile */}
          <button 
            onClick={onMenuToggle}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-sm font-semibold">{title}</h1>
        </div>
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
