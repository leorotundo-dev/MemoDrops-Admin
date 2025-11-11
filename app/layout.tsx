import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "@/components/shared/Providers";

export const metadata = {
  title: "MemoDrops Admin",
  description: "Dashboard administrativo do MemoDrops"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
