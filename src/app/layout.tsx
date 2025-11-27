import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AutoRefresher } from "@/components/AutoRefresher";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus AI - パーソナルインテリジェンス",
  description: "AI駆動のパーソナライズされた情報収集プラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jakarta.className} bg-[#0f172a] text-slate-50`}>
        <AutoRefresher />
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
