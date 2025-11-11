'use client';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';

export function Modal({ open, onClose, title, children, footer }:{ open:boolean; onClose:()=>void; title?:string; children:React.ReactNode; footer?:React.ReactNode }){
  useEffect(()=>{
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return ()=> document.removeEventListener('keydown', onEsc);
  }, [onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="font-medium">{title}</div>
            <button className="text-slate-500 hover:text-slate-900" onClick={onClose} aria-label="Fechar">✕</button>
          </div>
          <div className="p-4">{children}</div>
          {footer && <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
