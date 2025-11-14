'use client';
import { useEffect, useRef } from 'react';

// Chart minimalista sem libs externas (SVG)
export default function AreaSeries({ data }:{ data: Array<{dt:string, brl:number}> }){
  const w = 700, h = 200, pad = 24;
  const xs = data.map(d=>new Date(d.dt).getTime());
  const ys = data.map(d=>Number(d.brl)||0);
  const minX = Math.min(...xs, Date.now());
  const maxX = Math.max(...xs, Date.now());
  const minY = 0;
  const maxY = Math.max(...ys, 1);
  const x = (t:number)=> pad + (w-2*pad) * ((t-minX)/(maxX-minX || 1));
  const y = (v:number)=> h - pad - (h-2*pad) * ((v-minY)/(maxY-minY || 1));

  const path = ys.length ? ys.map((v,i)=> `${i===0 ? 'M' : 'L'} ${x(xs[i])} ${y(v)}`).join(' ') : '';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[220px]">
      <rect x="0" y="0" width={w} height={h} fill="white" rx="8"/>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Area fill (light) */}
      <path d={`${path} L ${x(maxX)} ${y(0)} L ${x(minX)} ${y(0)} Z`} fill="currentColor" opacity="0.08" />
    </svg>
  );
}
