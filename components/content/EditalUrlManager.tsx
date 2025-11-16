'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface EditalUrlManagerProps {
  contestId: string;
  currentUrl?: string;
  onUrlUpdated?: (url: string) => void;
}

export function EditalUrlManager({ contestId, currentUrl, onUrlUpdated }: EditalUrlManagerProps) {
  const { data } = useSession();
  const token = (data as any)?.token as string | undefined;
  const [url, setUrl] = useState(currentUrl || '');
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const validateUrl = async () => {
    if (!url.trim()) {
      setValidationResult({ valid: false, message: 'URL vazia' });
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/editais/validate-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ url }),
        }
      );

      const result = await res.json();
      
      if (res.ok && result.valid) {
        setValidationResult({
          valid: true,
          message: `✅ PDF válido (${result.size || 'tamanho desconhecido'})`,
        });
      } else {
        setValidationResult({
          valid: false,
          message: `❌ ${result.message || 'URL inválida'}`,
        });
      }
    } catch (error: any) {
      setValidationResult({
        valid: false,
        message: `❌ Erro: ${error.message}`,
      });
    } finally {
      setValidating(false);
    }
  };

  const saveUrl = async () => {
    if (!url.trim()) return;

    setSaving(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/contests/${contestId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ edital_url: url }),
        }
      );

      if (res.ok) {
        onUrlUpdated?.(url);
        alert('URL salva com sucesso!');
      } else {
        const error = await res.json();
        alert(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
      }
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          URL do Edital (PDF)
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemplo.com/edital.pdf"
            className="input flex-1"
            disabled={validating || saving}
          />
          <button
            onClick={validateUrl}
            disabled={validating || !url.trim()}
            className="btn btn-secondary"
          >
            {validating ? '⏳' : '🔍'} Validar
          </button>
        </div>
      </div>

      {validationResult && (
        <div
          className={`p-3 rounded-lg text-sm ${
            validationResult.valid
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {validationResult.message}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={saveUrl}
          disabled={saving || !url.trim() || (validationResult ? !validationResult.valid : false)}
          className="btn btn-primary"
        >
          {saving ? '⏳ Salvando...' : '💾 Salvar URL'}
        </button>
        
        {currentUrl && url !== currentUrl && (
          <button
            onClick={() => setUrl(currentUrl)}
            className="btn btn-ghost"
          >
            ↩️ Cancelar
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Cole a URL direta do PDF do edital</p>
        <p>• A URL será validada antes de salvar</p>
        <p>• Após salvar, você poderá processar a hierarquia</p>
      </div>
    </div>
  );
}
