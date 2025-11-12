'use client';
import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    // Se ficar mais de 5 segundos em loading, considera como erro
    const timeout = setTimeout(() => {
      if (status === "loading") {
        setLoadingTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Se timeout ou erro, redireciona para login
  if (loadingTimeout) {
    router.push("/login");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[16rem_1fr]">
      <Sidebar />
      <div className="min-h-screen flex flex-col">
        <Header title="Dashboard" />
        <main className="container py-6 space-y-6">{children}</main>
      </div>
    </div>
  );
}
