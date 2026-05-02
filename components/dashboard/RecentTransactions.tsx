"use client";

import type { Transaction } from "@/lib/types";
import { ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
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
  }).format(new Date(dateStr));
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
      <div className="glass-card" style={{ padding: 24 }}>
        <div className="skeleton" style={{ height: 20, width: "50%", marginBottom: 20 }} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 12, width: "40%" }} />
            </div>
            <div className="skeleton" style={{ height: 18, width: 80 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 16 }}>Transaksi — {periodLabel}</h3>
          <p style={{ fontSize: 13, color: "hsl(215 20% 55%)", marginTop: 4 }}>
            {transactions.length} transaksi ditemukan
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "hsl(215 20% 50%)" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>📊</p>
          <p style={{ fontWeight: 600 }}>Belum ada transaksi</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Mulai catat pemasukan atau pengeluaran pertama Anda</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {transactions.map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 8px",
                borderRadius: 10,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(220 20% 13%)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Icon */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background:
                    t.type === "income"
                      ? "hsl(142 71% 45% / 0.15)"
                      : "hsl(0 72% 51% / 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {t.type === "income" ? (
                  <ArrowUpRight size={20} color="hsl(142 71% 55%)" />
                ) : (
                  <ArrowDownRight size={20} color="hsl(0 72% 65%)" />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.category}
                </p>
                <p style={{ fontSize: 12, color: "hsl(215 20% 50%)", marginTop: 2 }}>
                  {t.description ? `${t.description} • ` : ""}
                  {formatDate(t.transaction_date)}
                </p>
              </div>

              {/* Amount */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: t.type === "income" ? "hsl(142 71% 55%)" : "hsl(0 72% 65%)",
                  }}
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatRupiah(t.amount)}
                </p>
                <span className={t.type === "income" ? "badge-income" : "badge-expense"}>
                  {t.type === "income" ? "Masuk" : "Keluar"}
                </span>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(t.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "hsl(215 20% 40%)",
                  padding: 4,
                  borderRadius: 6,
                  display: "flex",
                  transition: "color 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 72% 65%)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(215 20% 40%)")}
                title="Hapus transaksi"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
