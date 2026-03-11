import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DPDP GapX — DPDP Act 2023 Compliance Scanner",
  description: "Instant gap analysis for India's Digital Personal Data Protection Act 2023. Know where your website stands.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
