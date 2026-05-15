import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Kas Kawan — Asisten Keuangan UMKM",
  description:
    "Kelola keuangan bisnis UMKM Anda dengan mudah. Scan struk, input suara, dan analisis AI dalam satu platform modern.",
  keywords: ["keuangan UMKM", "kas kawan", "aplikasi keuangan", "scan struk", "pembukuan umkm"],
  authors: [{ name: "Kas Kawan" }],
  creator: "Kas Kawan",
  publisher: "Kas Kawan",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Kas Kawan — Asisten Keuangan UMKM",
    description: "Kelola keuangan bisnis UMKM Anda dengan mudah. Scan struk, input suara, dan analisis AI dalam satu platform modern.",
    url: "https://kaskawan.web.id",
    siteName: "Kas Kawan",
    images: [
      {
        url: "/logo.png", 
        width: 800,
        height: 600,
        alt: "Kas Kawan Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kas Kawan — Asisten Keuangan UMKM",
    description: "Kelola keuangan bisnis UMKM Anda dengan mudah. Scan struk, input suara, dan analisis AI dalam satu platform modern.",
    images: ["/logo.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050B14", // Menyesuaikan dengan theme dark app
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
