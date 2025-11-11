import Link from "next/link";
import { NavItem } from "./types";

const NAV: NavItem[] = [
  { href: "/", label: "Visão Geral" },
  { href: "/users", label: "Usuários" },
  { href: "/content/contests", label: "Concursos" },
  { href: "/content/subjects", label: "Matérias" },
  { href: "/financeiro", label: "Financeiro" },
  { href: "/monitoring", label: "Monitoramento" },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:block md:w-64 bg-white border-r border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <div className="text-lg font-bold">MemoDrops Admin</div>
      </div>
      <nav className="p-3 space-y-1">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-sm">
            {n.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
