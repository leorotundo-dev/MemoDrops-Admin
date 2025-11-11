'use client';
import { Input, Label } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

export function ContestForm({ initial, onSubmit, onCancel }:{ initial?: any; onSubmit: (data:any)=>Promise<void>; onCancel: ()=>void }){
  const [form, setForm] = useState<any>(initial || { name: '', banca: '', ano: new Date().getFullYear(), nivel: 'Superior' });
  const { push } = useToast();
  const submit = async ()=>{
    await onSubmit(form);
    push('Concurso salvo', 'success');
    onCancel();
  };
  return (
    <div className="space-y-3">
      <div>
        <Label>Nome</Label>
        <Input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Banca</Label>
          <Input value={form.banca} onChange={e=>setForm({ ...form, banca: e.target.value })} />
        </div>
        <div>
          <Label>Ano</Label>
          <Input type="number" value={form.ano} onChange={e=>setForm({ ...form, ano: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <Label>Nível</Label>
        <Input value={form.nivel} onChange={e=>setForm({ ...form, nivel: e.target.value })} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={submit}>Salvar</Button>
      </div>
    </div>
  );
}
