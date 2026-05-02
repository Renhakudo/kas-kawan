import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Kas Kawan — Asisten Keuangan UMKM",
  description:
    "Kelola keuangan bisnis UMKM Anda dengan mudah. Scan struk, input suara, dan analisis AI dalam satu platform modern.",
  keywords: ["keuangan UMKM", "kas kawan", "aplikasi keuangan", "scan struk"],
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
              background: "hsl(220 20% 13%)",
              border: "1px solid hsl(220 20% 22%)",
              color: "hsl(210 40% 96%)",
            },
          }}
        />
      </body>
    </html>
  );
}
