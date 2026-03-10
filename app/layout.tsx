import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "DPDP Comply — Data Protection Compliance Platform",
  description: "India's Digital Personal Data Protection Act 2023 compliance management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen" style={{ background: 'var(--background)' }}>
            <div className="p-8 max-w-screen-xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
