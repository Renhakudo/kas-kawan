"use client";

import Link from "next/link";
import {
  TrendingUp,
  Camera,
  Mic,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Sparkles,
  BarChart3,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Scan Struk",
    desc: "Foto struk belanja — AI kami ekstrak semua data otomatis dalam hitungan detik.",
    color: "hsl(142 71% 45%)",
  },
  {
    icon: Mic,
    title: "Input Suara",
    desc: 'Cukup ucapkan "Beli kopi 15 ribu" dan transaksi langsung tercatat.',
    color: "hsl(217 91% 60%)",
  },
  {
    icon: BarChart3,
    title: "Dashboard Cerdas",
    desc: "Grafik arus kas harian dan bulanan yang memperlihatkan kondisi keuangan bisnis.",
    color: "hsl(270 91% 65%)",
  },
  {
    icon: MessageSquare,
    title: "Asisten AI",
    desc: "Tanya kondisi keuangan Anda kapan saja. Chatbot kami siap memberikan saran bisnis.",
    color: "hsl(38 92% 50%)",
  },
];

const benefits = [
  "Tidak perlu keahlian akuntansi",
  "Otomatisasi pencatatan 90%",
  "Laporan keuangan real-time",
  "Aman & terenkripsi",
];

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at top, hsl(142 71% 45% / 0.08) 0%, transparent 60%), hsl(220 20% 7%)",
        overflowX: "hidden",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: "1px solid hsl(220 20% 12%)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "hsl(220 20% 7% / 0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background:
                "linear-gradient(135deg, hsl(142 71% 45%), hsl(161 94% 30%))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrendingUp size={20} color="white" />
          </div>
          <span
            style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}
          >
            Kas <span className="gradient-text">Kawan</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login">
            <button className="btn-secondary" style={{ fontSize: 14 }}>
              Masuk
            </button>
          </Link>
          <Link href="/register">
            <button className="btn-primary" style={{ fontSize: 14 }}>
              Mulai Gratis
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "100px 24px 80px",
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "hsl(142 71% 45% / 0.12)",
            border: "1px solid hsl(142 71% 45% / 0.3)",
            borderRadius: 100,
            padding: "6px 16px",
            fontSize: 13,
            color: "hsl(142 71% 65%)",
            fontWeight: 600,
            marginBottom: 28,
          }}
        >
          <Sparkles size={14} />
          Didukung Google Gemini & Grok AI
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: 24,
          }}
        >
          Keuangan UMKM Anda,{" "}
          <span className="gradient-text">Dikelola AI</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "hsl(215 20% 65%)",
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          Stop buang waktu catat manual. Scan struk, bicara ke mikrofon, atau
          ketik — Kas Kawan catat semua transaksi otomatis dan analisis keuangan
          bisnis Anda.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register">
            <button
              className="btn-primary"
              style={{
                fontSize: 16,
                padding: "14px 32px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Mulai Sekarang — Gratis
              <ArrowRight size={18} />
            </button>
          </Link>
          <Link href="/login">
            <button className="btn-secondary" style={{ fontSize: 16, padding: "14px 32px" }}>
              Sudah punya akun? Masuk
            </button>
          </Link>
        </div>

        {/* Benefits */}
        <div
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 48,
          }}
        >
          {benefits.map((b) => (
            <div
              key={b}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "hsl(215 20% 65%)",
                fontSize: 14,
              }}
            >
              <CheckCircle size={16} color="hsl(142 71% 50%)" />
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px 100px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="glass-card animate-fade-in-up"
              style={{ padding: 28 }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${f.color}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <f.icon size={24} color={f.color} />
              </div>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 8,
                }}
              >
                {f.title}
              </h3>
              <p style={{ color: "hsl(215 20% 60%)", lineHeight: 1.6, fontSize: 14 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Security note */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 60,
            color: "hsl(215 20% 50%)",
            fontSize: 14,
          }}
        >
          <Shield size={16} />
          Data Anda aman — Dilindungi Row Level Security Supabase & enkripsi end-to-end
        </div>
      </section>
    </div>
  );
}
