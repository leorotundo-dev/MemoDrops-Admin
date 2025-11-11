'use client';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastItem = { id: string; message: string; type?: 'success'|'error'|'info' };
const ToastCtx = createContext<{ push:(msg:string,type?:ToastItem['type'])=>void } | null>(null);

export function ToastProvider({ children }:{ children: React.ReactNode }){
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((message: string, type: ToastItem['type']='info')=>{
    const id = Math.random().toString(36).slice(2);
    setItems(prev => [...prev, { id, message, type }]);
    setTimeout(()=> setItems(prev => prev.filter(i=> i.id !== id)), 3500);
  },[]);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {items.map(i => (
          <div key={i.id} className={`px-3 py-2 rounded-md border shadow-card text-sm ${
            i.type==='success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
            i.type==='error' ? 'bg-rose-50 border-rose-200 text-rose-900' :
            'bg-white border-slate-200 text-slate-900'
          }`}>
            {i.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(){
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
