'use client';

import { useState } from 'react';

interface BancaLogoProps {
  bancaId: number;
  bancaName: string;
  shortName?: string;
  displayName?: string;
  className?: string;
}

export function BancaLogo({ bancaId, bancaName, shortName, displayName, className = '' }: BancaLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const initials = (shortName || displayName || bancaName).slice(0, 3).toUpperCase();
  const timestamp = Date.now();
  
  return (
    <div className={`h-24 flex items-center justify-center bg-slate-50 rounded relative ${className}`}>
      {!imageError ? (
        <img 
          src={`https://api-production-5ffc.up.railway.app/logos/bancas/${bancaId}?v=${timestamp}`} 
          alt={displayName || bancaName} 
          className={`max-h-20 max-w-full object-contain transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
        />
      ) : null}
      
      {(imageError || !imageLoaded) && (
        <div className="text-4xl font-bold text-slate-300 absolute inset-0 flex items-center justify-center">
          {initials}
        </div>
      )}
    </div>
  );
}
