"use client";

import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  type: "income" | "expense" | "balance";
  change?: number;
  loading?: boolean;
  periodLabel?: string;
}

function formatRupiah(amount: number) {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  }
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
    color: "var(--color-income)",
    bg: "var(--color-income-bg)",
    border: "var(--color-income-border)",
    gradientFrom: "var(--color-income-bg)",
    gradientTo: "transparent",
    emoji: "📈",
    label: "Total Pemasukan",
  },
  expense: {
    icon: TrendingDown,
    color: "var(--color-expense)",
    bg: "var(--color-expense-bg)",
    border: "var(--color-expense-border)",
    gradientFrom: "var(--color-expense-bg)",
    gradientTo: "transparent",
    emoji: "📉",
    label: "Total Pengeluaran",
  },
  balance: {
    icon: Wallet,
    color: "var(--color-balance)",
    bg: "var(--color-balance-bg)",
    border: "var(--color-balance-border)",
    gradientFrom: "var(--color-balance-bg)",
    gradientTo: "transparent",
    emoji: "💰",
    label: "Saldo Bersih",
  },
};

export function SummaryCard({
  title,
  amount,
  type,
  change,
  loading,
  periodLabel = "Bulan ini",
}: SummaryCardProps) {
  const cfg = config[type];
  const Icon = cfg.icon;

  if (loading) {
    return (
      <div className="stat-card" style={{ padding: "24px", borderRadius: "20px", minHeight: "150px", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div className="skeleton" style={{ height: "14px", width: "50%", borderRadius: "4px", marginTop: "8px" }} />
          <div className="skeleton" style={{ width: "48px", height: "48px", borderRadius: "14px" }} />
        </div>
        <div className="skeleton" style={{ height: "32px", width: "80%", marginBottom: "16px", borderRadius: "6px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="skeleton" style={{ height: "12px", width: "30%", borderRadius: "4px" }} />
          <div className="skeleton" style={{ height: "24px", width: "60px", borderRadius: "100px" }} />
        </div>
      </div>
    );
  }

  const isNegative = type === "balance" && amount < 0;
  const TrendIcon = change === undefined || change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;
  const trendColor = change === undefined || change === 0 ? "var(--text-muted)" : change > 0 ? "var(--color-income)" : "var(--color-expense)";
  const trendBg = change === undefined || change === 0 ? "var(--bg-elevated)" : change > 0 ? "var(--color-income-bg)" : "var(--color-expense-bg)";
  const trendBorder = change === undefined || change === 0 ? "var(--border)" : change > 0 ? "var(--color-income-border)" : "var(--color-expense-border)";

  return (
    <div
      className="stat-card"
      style={{
        padding: "clamp(16px, 4vw, 24px)",
        borderRadius: "20px",
        borderColor: cfg.border,
        background: `linear-gradient(145deg, ${cfg.gradientFrom}, var(--bg-card) 60%)`,
        minHeight: "150px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      {/* Decorative orb */}
      <div
        style={{
          position: "absolute",
          top: "-30px",
          right: "-30px",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: cfg.color,
          opacity: 0.06,
          filter: "blur(24px)",
          pointerEvents: "none",
          zIndex: 0
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
          <p style={{ 
            fontSize: "12px", 
            color: "var(--text-secondary)", 
            fontWeight: 800, 
            letterSpacing: "0.5px", 
            textTransform: "uppercase",
            marginTop: "6px"
          }}>
            {title || cfg.label}
          </p>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
            }}
          >
            <Icon size={24} color={cfg.color} />
          </div>
        </div>

        <p
          style={{
            fontSize: "clamp(24px, 3vw, 32px)",
            fontWeight: 900,
            color: isNegative ? "var(--color-expense)" : cfg.color,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}
        >
          {formatRupiah(amount)}
        </p>
      </div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{periodLabel}</p>
        
        {change !== undefined && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "4px",
            background: trendBg,
            border: `1px solid ${trendBorder}`,
            padding: "4px 10px",
            borderRadius: "100px"
          }}>
            <TrendIcon size={14} color={trendColor} strokeWidth={3} />
            <span style={{ fontSize: "12px", fontWeight: 800, color: trendColor }}>
              {change === 0 ? "—" : `${Math.abs(change).toFixed(1)}%`}
            </span>
          </div>
        )}
      </div>

      {/* Bottom accent line (Dipertebal & Lebih Tegas) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "4px",
          borderRadius: "0 0 20px 20px",
          background: `linear-gradient(90deg, ${cfg.color}, transparent)`,
          opacity: 0.5,
          zIndex: 0
        }}
      />
    </div>
  );
}
