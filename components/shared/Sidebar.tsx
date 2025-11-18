'use client';
import Link from "next/link";
import { NavItem } from "./types";
import { useEffect } from "react";

const NAV: NavItem[] = [
  { href: "/", label: "Visão Geral" },
  { href: "/users", label: "Usuários" },
  { href: "/content/contests", label: "Concursos" },
  { href: "/content/subjects", label: "Matérias" },
  { href: "/content/drops", label: "Drops" },
  { href: "/financeiro", label: "Financeiro" },
  { href: "/scrapers", label: "Scrapers" },
  { href: "/bancas", label: "Bancas" },
  { href: "/monitoring", label: "Monitoramento" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  // Fecha o menu ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-slate-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-lg font-bold">MemoDrops Admin</div>
          {/* Botão fechar apenas no mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
            aria-label="Fechar menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {NAV.map((n) => (
            <Link 
              key={n.href} 
              href={n.href} 
              className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-sm"
              onClick={() => onClose()} // Fecha o menu ao clicar em um link no mobile
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
