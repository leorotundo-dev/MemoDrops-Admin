'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input, Label } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function NewPlanPage(){
  const { data } = useSession(); const token = (data as any)?.accessToken as string | undefined;
  const router = useRouter(); const { push } = useToast();
  const [form, setForm] = useState<any>({ name:'', price_monthly: 0, ai_limit: 0, features: [] });

  const onCreate = async ()=>{
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/finance/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(form)
    });
    if (res.ok){ push('Plano criado', 'success'); router.push('/finance'); } else { push('Falha ao criar plano', 'error'); }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-lg font-semibold">Novo Plano</h1>
      <div>
        <Label>Nome</Label>
        <Input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Preço mensal</Label>
          <Input type="number" value={form.price_monthly} onChange={e=>setForm({ ...form, price_monthly: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Limite IA</Label>
          <Input type="number" value={form.ai_limit} onChange={e=>setForm({ ...form, ai_limit: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <Label>Features (separadas por vírgula)</Label>
        <Input value={Array.isArray(form.features)? form.features.join(', ') : (form.features||'')} onChange={e=>setForm({ ...form, features: e.target.value.split(',').map((s)=>s.trim()) })} />
      </div>
      <Button onClick={onCreate}>Criar</Button>
    </div>
  );
}
