'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input, Label } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function NewCostPage(){
  const { data } = useSession(); const token = (data as any)?.accessToken as string | undefined;
  const router = useRouter(); const { push } = useToast();
  const [form, setForm] = useState<any>({ service:'', category:'Infrastructure', amount: 0, date: new Date().toISOString().slice(0,10) });

  const onCreate = async ()=>{
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/finance/costs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(form)
    });
    if (res.ok){ push('Custo registrado', 'success'); router.push('/finance'); } else { push('Falha ao registrar custo', 'error'); }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-lg font-semibold">Registrar custo</h1>
      <div>
        <Label>Serviço</Label>
        <Input value={form.service} onChange={e=>setForm({ ...form, service: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Categoria</Label>
          <Input value={form.category} onChange={e=>setForm({ ...form, category: e.target.value })} />
        </div>
        <div>
          <Label>Valor</Label>
          <Input type="number" value={form.amount} onChange={e=>setForm({ ...form, amount: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <Label>Data</Label>
        <Input type="date" value={form.date} onChange={e=>setForm({ ...form, date: e.target.value })} />
      </div>
      <Button onClick={onCreate}>Salvar</Button>
    </div>
  );
}
