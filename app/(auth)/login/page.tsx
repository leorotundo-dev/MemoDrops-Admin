'use client';
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbackUrl = useSearchParams().get('callbackUrl') || "/";
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl });
    setLoading(false);
    if (res?.error) setError("Credenciais inválidas"); else window.location.href = callbackUrl;
  }
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-full max-w-sm card p-6">
        <div className="text-lg font-semibold mb-4">Entrar no MemoDrops Admin</div>
        <form onSubmit={onSubmit} className="grid gap-3">
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button className="btn btn-primary" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        </form>
      </div>
    </div>
  );
}
