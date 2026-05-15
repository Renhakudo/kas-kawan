import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Kas Kawan — Asisten Keuangan UMKM",
  description:
    "Kelola keuangan bisnis UMKM Anda dengan mudah. Scan struk, input suara, dan analisis AI dalam satu platform modern.",
  keywords: ["keuangan UMKM", "kas kawan", "aplikasi keuangan", "scan struk"],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            },
          }}
        />
      </body>
    </html>
  );
}
