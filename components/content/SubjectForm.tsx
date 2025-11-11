'use client';
import { Input, Label } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

export function SubjectForm({ initial, onSubmit, onCancel }:{ initial?: any; onSubmit:(data:any)=>Promise<void>; onCancel:()=>void }){
  const [form, setForm] = useState<any>(initial || { name: '' });
  const { push } = useToast();
  const submit = async ()=>{
    await onSubmit(form);
    push('Matéria salva', 'success');
    onCancel();
  };
  return (
    <div className="space-y-3">
      <div>
        <Label>Nome</Label>
        <Input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={submit}>Salvar</Button>
      </div>
    </div>
  );
}
