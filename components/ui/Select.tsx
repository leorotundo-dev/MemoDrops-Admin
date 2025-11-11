'use client';
import { cn } from '@/lib/cn';
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>){
  return <select {...props} className={cn("input", props.className)} />;
}
