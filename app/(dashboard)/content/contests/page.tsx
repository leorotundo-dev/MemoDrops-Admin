'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ContestForm } from '@/components/content/ContestForm';
import { useToast } from '@/components/ui/Toast';

type Contest = { id: string; name: string; banca?: string; ano?: number; nivel?: string; total_subjects?: number; };

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export default function ContestsPage(){
  const { data } = useSession();
  const token = (data as any)?.token as string | undefined;
  const [items, setItems] = useState<Contest[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [editing, setEditing] = useState<Contest | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  const fetchList = async (currentPage = page, q = search)=>{
    try{
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.append('search', q);
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/contests/paginated?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      setItems(json.data || []);
      setPagination(json.pagination || null);
    }catch(e){ 
      console.error(e); 
      push('Erro ao carregar concursos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ 
    if(token) {
      setPage(1); // Reset to page 1 when search changes
      fetchList(1, search);
    }
  },[search, token]);

  useEffect(()=>{ 
    if(token) fetchList(page, search);
  },[page]);

  const columns = useMemo<ColumnDef<Contest>[]>(() => [
    { 
      accessorKey: "name", 
      header: "Nome",
      cell: ({ row }) => (
        <a href={`/content/contests/${row.original.id}`} className="text-blue-600 hover:underline font-medium">
          {row.original.name}
        </a>
      )
    },
    { accessorKey: "banca", header: "Banca" },
    { accessorKey: "ano", header: "Ano" },
    { accessorKey: "nivel", header: "Nível" },
    { accessorKey: "total_subjects", header: "Matérias" },
    { id: "actions", header: "", cell: ({ row }) => (
      <div className="flex gap-2 justify-end">
        <button className="btn btn-ghost" onClick={()=> setEditing(row.original)}>Editar</button>
        <button className="btn btn-ghost" onClick={()=> setDeleting(row.original)}>Excluir</button>
      </div>
    ), enableSorting: false }
  ], []);

  const onCreate = async (data: any)=>{
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/contests`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(data)
    });
    if (res.ok){ push('Concurso criado', 'success'); setCreating(false); fetchList(); } else { push('Erro ao criar concurso', 'error'); }
  };
  const onEdit = async (data: any)=>{
    if (!editing) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/contests/${editing.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(data)
    });
    if (res.ok){ push('Concurso atualizado', 'success'); setEditing(null); fetchList(); } else { push('Erro ao atualizar concurso', 'error'); }
  };
  const onDelete = async ()=>{
    if (!deleting) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/contests/${deleting.id}`, {
      method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (res.ok){ push('Concurso excluído', 'success'); setDeleting(null); fetchList(); } else { push('Erro ao excluir', 'error'); }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Concursos</h1>
        <button className="btn btn-primary" onClick={()=> setCreating(true)}>Novo concurso</button>
      </div>
      
      <input 
        className="input max-w-sm" 
        placeholder="Buscar por nome ou banca…" 
        value={search} 
        onChange={e=>setSearch(e.target.value)} 
      />
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={items} />
          
          {pagination && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-gray-600">
                Mostrando {items.length} de {pagination.total} concursos
                {pagination.totalPages > 1 && ` (Página ${pagination.page} de ${pagination.totalPages})`}
              </div>
              
              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => goToPage(1)}
                    disabled={!pagination.hasPrev}
                  >
                    Primeira
                  </button>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => goToPage(page - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Anterior
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          className={`btn btn-sm ${pageNum === page ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => goToPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => goToPage(page + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Próxima
                  </button>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => goToPage(pagination.totalPages)}
                    disabled={!pagination.hasNext}
                  >
                    Última
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <Modal open={creating} onClose={()=> setCreating(false)} title="Novo concurso">
        <ContestForm onSubmit={onCreate} onCancel={()=> setCreating(false)} />
      </Modal>

      <Modal open={!!editing} onClose={()=> setEditing(null)} title="Editar concurso">
        {editing && <ContestForm initial={editing} onSubmit={onEdit} onCancel={()=> setEditing(null)} />}
      </Modal>

      <Modal open={!!deleting} onClose={()=> setDeleting(null)} title="Excluir concurso">
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
