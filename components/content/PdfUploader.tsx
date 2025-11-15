'use client';
import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface PdfUploaderProps {
  contestId: string;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
}

export function PdfUploader({ contestId, onUploadSuccess, onUploadError }: PdfUploaderProps) {
  const { data } = useSession();
  const token = (data as any)?.token as string | undefined;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar se é PDF
    if (file.type !== 'application/pdf') {
      onUploadError?.('Por favor, selecione um arquivo PDF');
      return;
    }

    // Validar tamanho (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      onUploadError?.('Arquivo muito grande. Tamanho máximo: 50MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Criar FormData
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('contestId', contestId);

      // Upload com progress
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onUploadSuccess?.(response.url);
        } else {
          const error = JSON.parse(xhr.responseText);
          onUploadError?.(error.message || 'Erro ao fazer upload');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        onUploadError?.('Erro de rede ao fazer upload');
        setUploading(false);
      });

      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/contests/${contestId}/upload-pdf`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);

    } catch (error: any) {
      onUploadError?.(error.message || 'Erro ao fazer upload');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        
        {!uploading ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
            disabled={uploading}
          >
            📄 Selecionar PDF do Edital
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Fazendo upload...</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{progress}%</p>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        <p>• Formato: PDF</p>
        <p>• Tamanho máximo: 50MB</p>
        <p>• O PDF será processado automaticamente após o upload</p>
      </div>
    </div>
  );
}
