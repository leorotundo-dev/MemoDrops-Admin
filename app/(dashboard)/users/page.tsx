'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Label } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

type User = { id:string; email:string; name?:string; plan?:string; cash_balance?:number; created_at?:string; };

export default function UsersPage(){
  const { data } = useSession();
  const token = (data as any)?.accessToken as string | undefined;
  const [items, setItems] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('');
  const [selected, setSelected] = useState<User | null>(null);
  const [addCashOpen, setAddCashOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [cash, setCash] = useState(0);
  const [reason, setReason] = useState('');
  const { push } = useToast();

  const fetchList = async ()=>{
    try{
      const qp = new URLSearchParams({ search, plan }).toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/users${qp ? ('?'+qp) : ''}`;
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const json = await res.json();
      setItems(json.data || []);
    }catch(e){ console.error(e); }
  };

  useEffect(()=>{ fetchList(); },[search, plan, token]);

  const columns = useMemo<ColumnDef<User>[]>(() => [
    { accessorKey: "email", header: "Email" },
    { accessorKey: "name", header: "Nome" },
    { accessorKey: "plan", header: "Plano", cell: ({ row }) => <Badge>{row.original.plan || 'free'}</Badge> },
    { accessorKey: "cash_balance", header: "Cash", cell: ({ row }) => (row.original.cash_balance ?? 0).toFixed(2) },
    { accessorKey: "created_at", header: "Criado em", cell: ({ row }) => (row.original.created_at?.slice(0,10) || '—') },
    { id: 'actions', header: '', cell: ({ row }) => (
      <div className="flex gap-2 justify-end">
        <button className="btn btn-ghost" onClick={()=>{ setSelected(row.original); setAddCashOpen(true); }}>Adicionar cash</button>
        <button className="btn btn-ghost" onClick={()=>{ setSelected(row.original); setBanOpen(true); }}>Banir</button>
      </div>
    ), enableSorting: false }
  ], []);

  const onAddCash = async ()=>{
    if (!selected) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/users/${selected.id}/add-cash`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ amount: cash, reason })
    });
    if (res.ok){ push('Cash adicionado', 'success'); setAddCashOpen(false); setCash(0); setReason(''); fetchList(); }
    else { push('Falha ao adicionar cash', 'error'); }
  };

  const onBan = async ()=>{
    if (!selected) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/users/${selected.id}/ban`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ reason })
    });
    if (res.ok){ push('Usuário banido', 'success'); setBanOpen(false); setReason(''); fetchList(); }
    else { push('Falha ao banir', 'error'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Usuários</h1>
      <div className="flex gap-2 max-w-xl">
        <input className="input flex-1" placeholder="Buscar por e‑mail ou nome…" value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="input" value={plan} onChange={e=>setPlan(e.target.value)}>
          <option value="">Todos os planos</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="team">Team</option>
        </select>
      </div>
      <DataTable columns={columns} data={items} />

      <Modal open={addCashOpen} onClose={()=> setAddCashOpen(false)} title={`Adicionar cash para ${selected?.email || ''}`}>
        <div className="space-y-3">
          <div>
            <Label>Valor (R$)</Label>
            <Input type="number" value={cash} onChange={e=>setCash(Number(e.target.value))} />
          </div>
          <div>
            <Label>Motivo</Label>
            <Input value={reason} onChange={e=>setReason(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end">
            <button className="btn btn-ghost" onClick={()=> setAddCashOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={onAddCash}>Confirmar</button>
          </div>
        </div>
      </Modal>

      <Modal open={banOpen} onClose={()=> setBanOpen(false)} title={`Banir ${selected?.email || ''}`}>
        <div className="space-y-3">
          <div>
            <Label>Motivo</Label>
            <Input value={reason} onChange={e=>setReason(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end">
            <button className="btn btn-ghost" onClick={()=> setBanOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={onBan}>Banir</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
