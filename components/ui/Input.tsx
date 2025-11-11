'use client';
import { cn } from '@/lib/cn';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>){
  return <input {...props} className={cn("input", props.className)} />;
}
export function Label({ children }:{ children: React.ReactNode }){
  return <label className="label">{children}</label>;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>){
  return <textarea {...props} className={cn("input h-28", props.className)} />;
}
