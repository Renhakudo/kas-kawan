"use client";

import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  type: "income" | "expense" | "balance";
  change?: number;
  loading?: boolean;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const config = {
  income: {
    icon: TrendingUp,
    color: "hsl(142 71% 45%)",
    bg: "hsl(142 71% 45% / 0.1)",
    border: "hsl(142 71% 45% / 0.25)",
    label: "Total Pemasukan",
    emoji: "📈",
  },
  expense: {
    icon: TrendingDown,
    color: "hsl(0 72% 51%)",
    bg: "hsl(0 72% 51% / 0.1)",
    border: "hsl(0 72% 51% / 0.25)",
    label: "Total Pengeluaran",
    emoji: "📉",
  },
  balance: {
    icon: Wallet,
    color: "hsl(217 91% 60%)",
    bg: "hsl(217 91% 60% / 0.1)",
    border: "hsl(217 91% 60% / 0.25)",
    label: "Saldo Bersih",
    emoji: "💰",
  },
};

export function SummaryCard({ title, amount, type, loading }: SummaryCardProps) {
  const cfg = config[type];
  const Icon = cfg.icon;

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: 24 }}>
        <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 32, width: "80%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: "40%" }} />
      </div>
    );
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: 24,
        border: `1px solid ${cfg.border}`,
        background: `linear-gradient(135deg, ${cfg.bg}, hsl(220 20% 10%))`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative glow */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: cfg.color,
          opacity: 0.06,
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 13, color: "hsl(215 20% 60%)", fontWeight: 500, marginBottom: 8 }}>
            {title || cfg.label}
          </p>
          <p
            style={{
              fontSize: "clamp(20px, 3vw, 28px)",
              fontWeight: 800,
              color: cfg.color,
              letterSpacing: "-0.02em",
            }}
          >
            {formatRupiah(amount)}
          </p>
          <p style={{ fontSize: 12, color: "hsl(215 20% 45%)", marginTop: 6 }}>
            Bulan ini
          </p>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={22} color={cfg.color} />
        </div>
      </div>
    </div>
  );
}
