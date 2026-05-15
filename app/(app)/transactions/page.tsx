"use client";

import { useEffect, useState, useCallback } from "react";
import type { Transaction } from "@/lib/types";
import { ArrowUpRight, ArrowDownRight, Trash2, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/components/WalletProvider";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateStr));
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

export default function TransactionsPage() {
  const { selectedWalletId, loadingWallets } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const fetchTransactions = useCallback(async (walletId: string) => {
    setLoading(true);
    const res = await fetch(walletId ? `/api/transactions?wallet_id=${walletId}` : "/api/transactions");
    if (res.ok) {
      const { transactions } = await res.json();
      setTransactions(transactions || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loadingWallets) return;
    fetchTransactions(selectedWalletId);
  }, [fetchTransactions, selectedWalletId, loadingWallets]);

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
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      {/* ── HEADER ── */}
      <div style={{ marginBottom: "24px", flexShrink: 0 }}>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "4px" }}>Riwayat Transaksi</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Menampilkan {filtered.length} transaksi</p>
      </div>

      {/* ── STATS & FILTERS ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "24px", flexShrink: 0 }}>
        
        {/* Stats Row */}
        <div className="stats-grid">
          <div className="glass-card" style={{ padding: "16px 20px", borderRadius: "16px", border: "1px solid var(--color-income-border)", background: "var(--color-income-bg)" }}>
            <p style={{ fontSize: "12px", color: "var(--color-income)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Pemasukan</p>
            <p style={{ fontWeight: 900, color: "var(--color-income)", fontSize: "20px", letterSpacing: "-0.02em" }}>{formatRupiah(totalIncome)}</p>
          </div>
          <div className="glass-card" style={{ padding: "16px 20px", borderRadius: "16px", border: "1px solid var(--color-expense-border)", background: "var(--color-expense-bg)" }}>
            <p style={{ fontSize: "12px", color: "var(--color-expense)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Pengeluaran</p>
            <p style={{ fontWeight: 900, color: "var(--color-expense)", fontSize: "20px", letterSpacing: "-0.02em" }}>{formatRupiah(totalExpense)}</p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="toolbar-container">
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              id="tx-search"
              placeholder="Cari kategori atau keterangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px 12px 42px", borderRadius: "100px",
                border: "1px solid var(--border)", background: "var(--bg-card)",
                color: "var(--text-primary)", fontSize: "14px", outline: "none",
                fontFamily: "inherit", transition: "border-color 0.2s"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
            />
          </div>
          
          <div style={{ display: "flex", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "100px", padding: "4px" }}>
            {(["all", "income", "expense"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "8px 16px", borderRadius: "100px", border: "none",
                  background: filter === f ? "var(--bg-card)" : "transparent",
                  color: filter === f ? "var(--accent)" : "var(--text-secondary)",
                  fontWeight: filter === f ? 800 : 600, fontSize: "13px", cursor: "pointer", 
                  fontFamily: "inherit", transition: "all 0.2s",
                  boxShadow: filter === f ? "0 2px 8px rgba(0,0,0,0.05)" : "none"
                }}
              >
                {f === "all" ? "Semua" : f === "income" ? "Masuk" : "Keluar"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── LIST AREA (SCROLLABLE) ── */}
      <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, borderRadius: "24px", overflow: "hidden" }}>
        
        <div className="txn-list-container" style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div className="skeleton" style={{ width: "48px", height: "48px", borderRadius: "14px", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: "16px", width: "40%", marginBottom: "8px", borderRadius: "4px" }} />
                    <div className="skeleton" style={{ height: "12px", width: "25%", borderRadius: "4px" }} />
                  </div>
                  <div className="skeleton" style={{ height: "24px", width: "80px", borderRadius: "100px" }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "16px", border: "1px dashed var(--border)" }}>
              <Search size={40} style={{ marginBottom: "16px", opacity: 0.5 }} />
              <p style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", marginBottom: "4px" }}>Tidak ada transaksi</p>
              <p style={{ fontSize: "14px", textAlign: "center" }}>Coba ubah kata kunci pencarian atau filter tipe transaksi.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filtered.map((t, i) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex", alignItems: "center", gap: "16px", padding: "16px",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "1px solid transparent",
                    transition: "all 0.2s ease", borderRadius: "16px", margin: "0 -8px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-elevated)";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = i < filtered.length - 1 ? "var(--border)" : "transparent";
                  }}
                >
                  {/* Category icon */}
                  <div style={{ 
                    width: "48px", height: "48px", borderRadius: "14px", 
                    background: t.type === "income" ? "var(--color-income-bg)" : "var(--color-expense-bg)", 
                    border: `1px solid ${t.type === "income" ? "var(--color-income-border)" : "var(--color-expense-border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    fontSize: "22px", boxShadow: "var(--shadow-card)"
                  }}>
                    {getCategoryEmoji(t.category)}
                  </div>
                  
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text-primary)", marginBottom: "4px" }}>
                      {t.category}
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
                      {t.description ? `${t.description} • ` : ""}{formatDate(t.transaction_date)}
                    </p>
                  </div>

                  {/* Amount & Action */}
                  <div style={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <p style={{ fontWeight: 900, fontSize: "16px", color: t.type === "income" ? "var(--color-income)" : "var(--color-expense)", marginBottom: "6px" }}>
                        {t.type === "income" ? "+" : "-"}{formatRupiah(t.amount)}
                      </p>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "100px",
                        fontSize: "10px", fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase",
                        background: t.type === "income" ? "var(--color-income-bg)" : "var(--color-expense-bg)",
                        color: t.type === "income" ? "var(--color-income)" : "var(--color-expense)",
                        border: `1px solid ${t.type === "income" ? "var(--color-income-border)" : "var(--color-expense-border)"}`
                      }}>
                        {t.type === "income" ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                        {t.type === "income" ? "Masuk" : "Keluar"}
                      </div>
                    </div>
                    
                    {/* Delete Btn */}
                    <button
                      onClick={() => handleDelete(t.id)}
                      style={{ 
                        background: "var(--bg-card)", border: "1px solid var(--border)", cursor: "pointer", 
                        color: "var(--text-muted)", width: "36px", height: "36px", borderRadius: "10px", 
                        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" 
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--color-danger)"; e.currentTarget.style.background = "var(--color-expense-bg)"; e.currentTarget.style.borderColor = "var(--color-expense-border)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                      title="Hapus transaksi"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RESPONSIVE CSS ── */}
      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .toolbar-container {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
        }

        /* Custom Scrollbar */
        .txn-list-container::-webkit-scrollbar {
          width: 8px;
        }
        .txn-list-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .txn-list-container::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 10px;
        }
        .txn-list-container::-webkit-scrollbar-thumb:hover {
          background-color: var(--text-muted);
        }

        /* Mobile */
        @media (max-width: 480px) {
          .stats-grid {
            gap: 12px;
          }
          .toolbar-container {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
