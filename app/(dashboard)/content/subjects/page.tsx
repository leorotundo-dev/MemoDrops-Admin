'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/DataTable';
import { Modal } from '@/components/ui/Modal';
import { SubjectForm } from '@/components/content/SubjectForm';
import { useToast } from '@/components/ui/Toast';

type Subject = { id: string; name: string; total_decks?: number; };

export default function SubjectsPage(){
  const { data } = useSession();
  const token = (data as any)?.accessToken as string | undefined;
  const [items, setItems] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState<Subject | null>(null);
  const { push } = useToast();

  const fetchList = async (q = search)=>{
    try{
      const qs = q ? `?search=${encodeURIComponent(q)}` : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/subjects${qs}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      setItems(json.data || []);
    }catch(e){ console.error(e); }
  };

  useEffect(()=>{ fetchList(); },[search, token]);

  const columns = useMemo<ColumnDef<Subject>[]>(() => [
    { accessorKey: "name", header: "Nome" },
    { accessorKey: "total_decks", header: "Decks" },
    { id: "actions", header: "", cell: ({ row }) => (
      <div className="flex gap-2 justify-end">
        <button className="btn btn-ghost" onClick={()=> setEditing(row.original)}>Editar</button>
        <button className="btn btn-ghost" onClick={()=> setDeleting(row.original)}>Excluir</button>
      </div>
    ), enableSorting: false }
  ], []);

  const onCreate = async (data: any)=>{
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/subjects`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(data)
    });
    if (res.ok){ push('Matéria criada', 'success'); setCreating(false); fetchList(); } else { push('Erro ao criar matéria', 'error'); }
  };
  const onEdit = async (data: any)=>{
    if (!editing) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/subjects/${editing.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(data)
    });
    if (res.ok){ push('Matéria atualizada', 'success'); setEditing(null); fetchList(); } else { push('Erro ao atualizar matéria', 'error'); }
  };
  const onDelete = async ()=>{
    if (!deleting) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/subjects/${deleting.id}`, {
      method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (res.ok){ push('Matéria excluída', 'success'); setDeleting(null); fetchList(); } else { push('Erro ao excluir', 'error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Matérias</h1>
        <button className="btn btn-primary" onClick={()=> setCreating(true)}>Nova matéria</button>
      </div>
      <input className="input max-w-sm" placeholder="Buscar matéria…" value={search} onChange={e=>setSearch(e.target.value)} />
      <DataTable columns={columns} data={items} />

      <Modal open={creating} onClose={()=> setCreating(false)} title="Nova matéria">
        <SubjectForm onSubmit={onCreate} onCancel={()=> setCreating(false)} />
      </Modal>

      <Modal open={!!editing} onClose={()=> setEditing(null)} title="Editar matéria">
        {editing && <SubjectForm initial={editing} onSubmit={onEdit} onCancel={()=> setEditing(null)} />}
      </Modal>

      <Modal open={!!deleting} onClose={()=> setDeleting(null)} title="Excluir matéria">
        <div className="space-y-4">
          <p>Tem certeza que deseja excluir <b>{deleting?.name}</b>?</p>
          <div className="flex gap-2 justify-end">
            <button className="btn btn-ghost" onClick={()=> setDeleting(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={onDelete}>Excluir</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
