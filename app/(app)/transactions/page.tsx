"use client";

import { useEffect, useState, useCallback } from "react";
import type { Transaction } from "@/lib/types";
import { ArrowUpRight, ArrowDownRight, Trash2, Search, Filter } from "lucide-react";
import { toast } from "sonner";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dateStr));
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const fetchTransactions = useCallback(async () => {
    const res = await fetch("/api/transactions");
    if (res.ok) {
      const { transactions } = await res.json();
      setTransactions(transactions || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transaksi dihapus");
    } else {
      toast.error("Gagal menghapus");
    }
  };

  const filtered = transactions.filter((t) => {
    const matchFilter = filter === "all" || t.type === filter;
    const matchSearch = !search || t.category.toLowerCase().includes(search.toLowerCase()) || (t.description?.toLowerCase() || "").includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ padding: "32px 28px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 800, letterSpacing: "-0.02em" }}>Riwayat Transaksi</h1>
        <p style={{ color: "hsl(215 20% 55%)", marginTop: 6, fontSize: 14 }}>{transactions.length} total transaksi</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div className="glass-card" style={{ padding: 16, borderColor: "hsl(142 71% 45% / 0.3)" }}>
          <p style={{ fontSize: 12, color: "hsl(215 20% 55%)", marginBottom: 4 }}>Pemasukan</p>
          <p style={{ fontWeight: 700, color: "hsl(142 71% 55%)", fontSize: 18 }}>{formatRupiah(totalIncome)}</p>
        </div>
        <div className="glass-card" style={{ padding: 16, borderColor: "hsl(0 72% 51% / 0.3)" }}>
          <p style={{ fontSize: 12, color: "hsl(215 20% 55%)", marginBottom: 4 }}>Pengeluaran</p>
          <p style={{ fontWeight: 700, color: "hsl(0 72% 65%)", fontSize: 18 }}>{formatRupiah(totalExpense)}</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "hsl(215 20% 50%)" }} />
          <input
            id="tx-search"
            className="input-field"
            placeholder="Cari kategori atau keterangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36, fontSize: 14 }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "income", "expense"] as const).map((f) => (
            <button
              key={f}
              id={`filter-${f}`}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 14px", borderRadius: 8, border: "1px solid",
                borderColor: filter === f ? "hsl(142 71% 45% / 0.4)" : "hsl(220 20% 22%)",
                background: filter === f ? "hsl(142 71% 45% / 0.15)" : "transparent",
                color: filter === f ? "hsl(142 71% 65%)" : "hsl(215 20% 55%)",
                fontWeight: filter === f ? 600 : 500, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <Filter size={13} />
              {f === "all" ? "Semua" : f === "income" ? "Masuk" : "Keluar"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, width: "55%", marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 12, width: "35%" }} />
                </div>
                <div className="skeleton" style={{ height: 18, width: 90 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "hsl(215 20% 50%)" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
            <p style={{ fontWeight: 600 }}>Tidak ada transaksi ditemukan</p>
          </div>
        ) : (
          <div>
            {filtered.map((t, i) => (
              <div
                key={t.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 20px",
                  borderBottom: i < filtered.length - 1 ? "1px solid hsl(220 20% 14%)" : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(220 20% 11%)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: t.type === "income" ? "hsl(142 71% 45% / 0.15)" : "hsl(0 72% 51% / 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {t.type === "income" ? <ArrowUpRight size={18} color="hsl(142 71% 55%)" /> : <ArrowDownRight size={18} color="hsl(0 72% 65%)" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.category}</p>
                  <p style={{ fontSize: 12, color: "hsl(215 20% 50%)", marginTop: 1 }}>
                    {t.description ? `${t.description} • ` : ""}{formatDate(t.transaction_date)}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: t.type === "income" ? "hsl(142 71% 55%)" : "hsl(0 72% 65%)" }}>
                    {t.type === "income" ? "+" : "-"}{formatRupiah(t.amount)}
                  </p>
                  <span className={t.type === "income" ? "badge-income" : "badge-expense"} style={{ fontSize: 11 }}>
                    {t.type === "income" ? "Masuk" : "Keluar"}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(215 20% 40%)", padding: 6, borderRadius: 6, flexShrink: 0, transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 72% 65%)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(215 20% 40%)")}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
