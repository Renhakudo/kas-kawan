"use client";

import type { Transaction } from "@/lib/types";
import { ArrowUpRight, ArrowDownRight, Trash2, List } from "lucide-react";
import { toast } from "sonner";

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  periodLabel?: string;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

const CATEGORY_EMOJIS: Record<string, string> = {
  "Makanan": "🍽️", "Minuman": "☕", "Transportasi": "🚗", "Belanja": "🛍️",
  "Hiburan": "🎬", "Kesehatan": "💊", "Pendidikan": "📚", "Tagihan": "📄",
  "Gaji": "💼", "Penjualan": "💰", "Investasi": "📈", "Lainnya": "📦",
  "Food": "🍽️", "Transport": "🚗", "Shopping": "🛍️", "Entertainment": "🎬",
  "Health": "💊", "Education": "📚", "Bills": "📄", "Salary": "💼",
};

function getCategoryEmoji(category: string): string {
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return "📦";
}

export function RecentTransactions({
  transactions,
  loading,
  onDelete,
  periodLabel = "Terbaru",
}: RecentTransactionsProps) {
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("Transaksi dihapus");
      onDelete?.(id);
    } catch {
      toast.error("Gagal menghapus transaksi");
    }
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: "32px", borderRadius: "24px", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <div className="skeleton" style={{ height: "56px", width: "56px", borderRadius: "16px" }} />
          <div>
            <div className="skeleton" style={{ height: "20px", width: "160px", marginBottom: "8px", borderRadius: "4px" }} />
            <div className="skeleton" style={{ height: "14px", width: "100px", borderRadius: "4px" }} />
          </div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", gap: "16px", padding: "16px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none", alignItems: "center" }}>
            <div className="skeleton" style={{ width: "48px", height: "48px", borderRadius: "14px", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: "16px", width: "40%", marginBottom: "8px", borderRadius: "4px" }} />
              <div className="skeleton" style={{ height: "12px", width: "25%", borderRadius: "4px" }} />
            </div>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div className="skeleton" style={{ height: "18px", width: "100px", marginBottom: "8px", borderRadius: "4px" }} />
              <div className="skeleton" style={{ height: "22px", width: "60px", borderRadius: "100px" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    // Tambahkan height: "100%" agar tingginya flex mengikuti container grid secara otomatis
    <div className="glass-card" style={{ padding: "clamp(16px, 4vw, 24px)", borderRadius: "24px", display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, height: "100%" }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", flexShrink: 0 }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-card)", flexShrink: 0 }}>
          <List size={28} color="var(--accent)" />
        </div>
        <div>
          <h3 style={{ fontWeight: 900, fontSize: "20px", color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "4px" }}>
            Riwayat Transaksi
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
            {transactions.length} transaksi · {periodLabel}
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        // Modern Empty State
        <div style={{ flex: 1, minHeight: "280px", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: "var(--bg-elevated)", borderRadius: "16px", border: "1px dashed var(--border)" }}>
          <div style={{ width: "56px", height: "56px", background: "var(--bg-card)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
            <List size={24} color="var(--text-muted)" />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--text-primary)", fontSize: "16px", fontWeight: 800, marginBottom: "4px" }}>Belum ada transaksi</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Mulai catat pemasukan atau pengeluaran pertama Anda.</p>
          </div>
        </div>
      ) : (
        // LIST TRANSAKSI - Container ini dikasih Flex 1, MaxHeight, dan OverflowY
        <div 
          className="txn-scroll-container"
          style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            overflowY: "auto", 
            maxHeight: "360px", // Memaksa sejajar dengan tinggi chart (~280px chart + sum header)
            paddingRight: "8px", 
            marginRight: "-8px" // Kompensasi padding scrollbar
          }}
        >
          {transactions.map((t, idx) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px",
                borderRadius: "16px",
                transition: "all 0.2s ease",
                borderBottom: idx < transactions.length - 1 ? "1px solid var(--border)" : "1px solid transparent",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "var(--bg-elevated)";
                e.currentTarget.style.borderColor = "transparent";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = idx < transactions.length - 1 ? "var(--border)" : "transparent";
              }}
            >
              {/* Category icon */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: t.type === "income" ? "var(--color-income-bg)" : "var(--color-expense-bg)",
                  border: `1px solid ${t.type === "income" ? "var(--color-income-border)" : "var(--color-expense-border)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "22px",
                  boxShadow: "var(--shadow-card)"
                }}
              >
                {getCategoryEmoji(t.category)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 800, fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text-primary)", marginBottom: "4px" }}>
                  {t.category}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
                  {t.description ? `${t.description} · ` : ""}{formatDate(t.transaction_date)}
                </p>
              </div>

              {/* Amount & Badge */}
              <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <p style={{ fontWeight: 900, fontSize: "16px", letterSpacing: "-0.01em", color: t.type === "income" ? "var(--color-income)" : "var(--color-expense)", marginBottom: "6px" }}>
                  {t.type === "income" ? "+" : "-"}{formatRupiah(t.amount)}
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 10px",
                    borderRadius: "100px",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    background: t.type === "income" ? "var(--color-income-bg)" : "var(--color-expense-bg)",
                    color: t.type === "income" ? "var(--color-income)" : "var(--color-expense)",
                    border: `1px solid ${t.type === "income" ? "var(--color-income-border)" : "var(--color-expense-border)"}`,
                  }}
                >
                  {t.type === "income" ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                  {t.type === "income" ? "Masuk" : "Keluar"}
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(t.id)}
                style={{ 
                  background: "var(--bg-card)", 
                  border: "1px solid var(--border)", 
                  cursor: "pointer", 
                  color: "var(--text-muted)", 
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px", 
                  display: "flex", 
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease", 
                  flexShrink: 0,
                  marginLeft: "8px"
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.color = "var(--color-danger)"; 
                  e.currentTarget.style.background = "var(--color-expense-bg)"; 
                  e.currentTarget.style.borderColor = "var(--color-expense-border)"; 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.color = "var(--text-muted)"; 
                  e.currentTarget.style.background = "var(--bg-card)"; 
                  e.currentTarget.style.borderColor = "var(--border)"; 
                }}
                title="Hapus transaksi"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Custom Scrollbar CSS for Transactions */}
      <style>{`
        .txn-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .txn-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .txn-scroll-container::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 10px;
        }
        .txn-scroll-container::-webkit-scrollbar-thumb:hover {
          background-color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
