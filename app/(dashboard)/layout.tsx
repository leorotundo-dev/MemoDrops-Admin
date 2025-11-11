import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions as any);
  if (!session) redirect("/login");

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
