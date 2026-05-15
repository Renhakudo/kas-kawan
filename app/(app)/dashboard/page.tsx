"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import type { Transaction, ChartDataPoint } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { RefreshCw, PlusCircle, Sun, Download, FileText } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useWallet } from "@/components/WalletProvider";

type PeriodFilter = "today" | "week" | "month" | "year" | "all" | "custom";

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "week", label: "Minggu Ini" },
  { value: "month", label: "Bulan Ini" },
  { value: "year", label: "Tahun Ini" },
  { value: "all", label: "Semua Data" },
  { value: "custom", label: "Custom" },
];

function getDateRange(period: PeriodFilter, customStart?: string, customEnd?: string): { start: Date; end: Date } {
  const now = new Date();
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (period) {
    case "today": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      return { start, end };
    }
    case "week": {
      const day = now.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const start = new Date(now);
      start.setDate(now.getDate() + diffToMonday);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return { start, end };
    }
    case "year": {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      return { start, end };
    }
    case "custom": {
      const start = customStart ? new Date(customStart) : new Date(0);
      if (customEnd) {
         end = new Date(customEnd);
         end.setHours(23, 59, 59, 999);
      }
      return { start, end };
    }
    case "all":
    default: {
      return { start: new Date(0), end: new Date(8640000000000000) };
    }
  }
}

function filterTransactionsByPeriod(transactions: Transaction[], period: PeriodFilter, customStart?: string, customEnd?: string): Transaction[] {
  if (period === "all") return transactions;
  const { start, end } = getDateRange(period, customStart, customEnd);
  return transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    return d >= start && d <= end;
  });
}

function buildChartData(transactions: Transaction[], period: PeriodFilter, customStart?: string, customEnd?: string): ChartDataPoint[] {
  const today = new Date();

  if (period === "today") {
    const hours: ChartDataPoint[] = [];
    for (let h = 0; h < 24; h++) {
      const label = `${String(h).padStart(2, "0")}:00`;
      const hourStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, 0, 0, 0);
      const hourEnd = new Date(hourStart.getTime() + 3600000);
      const income = transactions
        .filter((t) => t.type === "income" && new Date(t.transaction_date) >= hourStart && new Date(t.transaction_date) < hourEnd)
        .reduce((s, t) => s + t.amount, 0);
      const expense = transactions
        .filter((t) => t.type === "expense" && new Date(t.transaction_date) >= hourStart && new Date(t.transaction_date) < hourEnd)
        .reduce((s, t) => s + t.amount, 0);
      hours.push({ date: label, income, expense });
    }
    return hours;
  }

  if (period === "week") {
    const days: ChartDataPoint[] = [];
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + diffToMonday + i);
      const dateKey = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const income = transactions
        .filter((t) => t.type === "income" && new Date(t.transaction_date) >= dayStart && new Date(t.transaction_date) < dayEnd)
        .reduce((s, t) => s + t.amount, 0);
      const expense = transactions
        .filter((t) => t.type === "expense" && new Date(t.transaction_date) >= dayStart && new Date(t.transaction_date) < dayEnd)
        .reduce((s, t) => s + t.amount, 0);
      days.push({ date: dateKey, income, expense });
    }
    return days;
  }

  if (period === "month") {
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const days: ChartDataPoint[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), i);
      const dateKey = `${i}`;
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const income = transactions
        .filter((t) => t.type === "income" && new Date(t.transaction_date) >= dayStart && new Date(t.transaction_date) < dayEnd)
        .reduce((s, t) => s + t.amount, 0);
      const expense = transactions
        .filter((t) => t.type === "expense" && new Date(t.transaction_date) >= dayStart && new Date(t.transaction_date) < dayEnd)
        .reduce((s, t) => s + t.amount, 0);
      days.push({ date: dateKey, income, expense });
    }
    return days;
  }

  if (period === "year") {
    const months: ChartDataPoint[] = [];
    for (let m = 0; m < 12; m++) {
      const label = new Date(today.getFullYear(), m, 1).toLocaleDateString("id-ID", { month: "short" });
      const monthStart = new Date(today.getFullYear(), m, 1);
      const monthEnd = new Date(today.getFullYear(), m + 1, 0, 23, 59, 59, 999);
      const income = transactions
        .filter((t) => t.type === "income" && new Date(t.transaction_date) >= monthStart && new Date(t.transaction_date) <= monthEnd)
        .reduce((s, t) => s + t.amount, 0);
      const expense = transactions
        .filter((t) => t.type === "expense" && new Date(t.transaction_date) >= monthStart && new Date(t.transaction_date) <= monthEnd)
        .reduce((s, t) => s + t.amount, 0);
      months.push({ date: label, income, expense });
    }
    return months;
  }

  if (period === "custom") {
    const days: ChartDataPoint[] = [];
    const { start, end } = getDateRange(period, customStart, customEnd);
    const dayCount = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
    const safeDayCount = Math.min(dayCount, 60);
    for (let i = 0; i < safeDayCount; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateKey = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const income = transactions
        .filter((t) => t.type === "income" && new Date(t.transaction_date) >= dayStart && new Date(t.transaction_date) < dayEnd)
        .reduce((s, t) => s + t.amount, 0);
      const expense = transactions
        .filter((t) => t.type === "expense" && new Date(t.transaction_date) >= dayStart && new Date(t.transaction_date) < dayEnd)
        .reduce((s, t) => s + t.amount, 0);
      days.push({ date: dateKey, income, expense });
    }
    return days;
  }

  const days: ChartDataPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    const income = transactions
      .filter((t) => t.type === "income" && new Date(t.transaction_date) >= dayStart && new Date(t.transaction_date) < dayEnd)
      .reduce((s, t) => s + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense" && new Date(t.transaction_date) >= dayStart && new Date(t.transaction_date) < dayEnd)
      .reduce((s, t) => s + t.amount, 0);
    days.push({ date: dateKey, income, expense });
  }
  return days;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

function exportToCSV(transactions: Transaction[], periodLabel: string) {
  const headers = ["ID Transaksi", "Tanggal", "Waktu", "Tipe", "Kategori", "Nominal (IDR)", "Deskripsi"];
  const rows = transactions.map((t) => {
    const d = new Date(t.transaction_date);
    const date = d.toLocaleDateString("id-ID", { year: "numeric", month: "2-digit", day: "2-digit" });
    const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const tipe = t.type === "income" ? "Pemasukan" : "Pengeluaran";
    const desc = t.description ? `"${t.description.replace(/"/g, '""')}"` : '""';
    return `"${t.id}","${date}","${time}","${tipe}","${t.category}","${t.amount}",${desc}`;
  });

  const csvContent = ["sep=,", headers.map(h => `"${h}"`).join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `kas-kawan_${periodLabel.replace(/\s+/g, "-")}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportToPDF(transactions: Transaction[], periodLabel: string) {
  const doc = new jsPDF();
  
  doc.setFontSize(14);
  doc.text(`Laporan Transaksi Kas Kawan`, 14, 15);
  doc.setFontSize(10);
  doc.text(`Periode: ${periodLabel} | Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 14, 22);

  const tableColumn = ["Tanggal", "Waktu", "Tipe", "Kategori", "Nominal (Rp)", "Deskripsi"];
  const tableRows: string[][] = [];

  transactions.forEach(t => {
    const d = new Date(t.transaction_date);
    const date = d.toLocaleDateString("id-ID", { year: "numeric", month: "2-digit", day: "2-digit" });
    const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const tipe = t.type === "income" ? "Pemasukan" : "Pengeluaran";
    const nominal = new Intl.NumberFormat("id-ID").format(t.amount);

    tableRows.push([date, time, tipe, t.category, nominal, t.description || ""]);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 28,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [22, 163, 74] },
  });
  
  doc.save(`kas-kawan_${periodLabel.replace(/\s+/g, "-")}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default function DashboardPage() {
  const { selectedWalletId, loadingWallets } = useWallet();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const supabase = createClient();

  const fetchData = useCallback(async (walletId?: string) => {
    try {
      const url = walletId ? `/api/transactions?wallet_id=${walletId}` : "/api/transactions";
      const [{ data: { session } }, transRes] = await Promise.all([
        supabase.auth.getSession(),
        fetch(url),
      ]);

      const user = session?.user;
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("shop_name").eq("id", user.id).single();
        if (profile?.shop_name) {
          setUserName(profile.shop_name);
        } else {
          setUserName(
            user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "Sobat"
          );
        }
      }

      if (transRes.ok) {
        const { transactions } = await transRes.json();
        setAllTransactions(transactions || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [supabase]);

  useEffect(() => {
    if (loadingWallets) return;
    setLoading(true);
    fetchData(selectedWalletId).finally(() => setLoading(false));
  }, [fetchData, selectedWalletId, loadingWallets]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(selectedWalletId || undefined);
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    setAllTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTransactions = useMemo(
    () => filterTransactionsByPeriod(allTransactions, period, customStart, customEnd),
    [allTransactions, period, customStart, customEnd]
  );

  const totalIncome = useMemo(
    () => filteredTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [filteredTransactions]
  );

  const totalExpense = useMemo(
    () => filteredTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [filteredTransactions]
  );

  const balance = totalIncome - totalExpense;

  const chartData = useMemo(
    () => buildChartData(period === "all" ? allTransactions : filteredTransactions, period, customStart, customEnd),
    [allTransactions, filteredTransactions, period, customStart, customEnd]
  );

  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "Data";
  const handleDownloadCSV = () => exportToCSV(filteredTransactions, periodLabel);
  const handleDownloadPDF = () => exportToPDF(filteredTransactions, periodLabel);

  return (
    <>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* ── Page Header ── */}
        <div className="dash-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Sun size={18} color="var(--color-warning)" />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600 }}>{getGreeting()},</span>
            </div>
            <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.1 }}>
              {loading ? <span className="skeleton" style={{ display: "inline-block", width: "180px", height: "36px", borderRadius: "8px" }} /> : `${userName} 👋`}
            </h1>
            <p style={{ color: "var(--text-muted)", marginTop: "6px", fontSize: "13px", fontWeight: 500 }}>
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
            <button onClick={handleRefresh} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "12px", fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap" }}>
              <RefreshCw size={15} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
              <span className="hide-on-mobile">Segarkan</span>
            </button>
            <Link href="/input" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "12px", fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap", boxShadow: "0 4px 16px var(--accent-glow)" }}>
                <PlusCircle size={16} />
                Catat Transaksi
              </button>
            </Link>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="dash-toolbar" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", boxShadow: "var(--shadow-card)", padding: "16px", display: "flex", gap: "16px" }}>

          {/* Period pills — wraps automatically */}
          <div className="period-filters" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", flex: 1 }}>
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "100px",
                  border: period === opt.value ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                  background: period === opt.value ? "var(--accent-muted)" : "transparent",
                  color: period === opt.value ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: "13px",
                  fontWeight: period === opt.value ? 800 : 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Custom date range */}
          {period === "custom" && (
            <div className="custom-date-group" style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "13px", fontWeight: 600, colorScheme: "dark", outline: "none", fontFamily: "inherit" }} />
              <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>–</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "13px", fontWeight: 600, colorScheme: "dark", outline: "none", fontFamily: "inherit" }} />
            </div>
          )}

          {/* Export buttons */}
          <div className="export-actions" style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleDownloadCSV} disabled={filteredTransactions.length === 0}
              className="export-btn"
              style={{
                display: "flex", justifyContent: "center", alignItems: "center", gap: "6px",
                padding: "10px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: 700,
                border: filteredTransactions.length === 0 ? "1px solid var(--border)" : "1px solid var(--color-income-border)",
                background: filteredTransactions.length === 0 ? "var(--bg-elevated)" : "var(--color-income-bg)",
                color: filteredTransactions.length === 0 ? "var(--text-muted)" : "var(--color-income)",
                cursor: filteredTransactions.length === 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "all 0.2s ease",
              }}>
              <Download size={16} /> CSV
            </button>
            <button onClick={handleDownloadPDF} disabled={filteredTransactions.length === 0}
              className="export-btn"
              style={{
                display: "flex", justifyContent: "center", alignItems: "center", gap: "6px",
                padding: "10px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: 700,
                border: filteredTransactions.length === 0 ? "1px solid var(--border)" : "1px solid var(--color-expense-border)",
                background: filteredTransactions.length === 0 ? "var(--bg-elevated)" : "var(--color-expense-bg)",
                color: filteredTransactions.length === 0 ? "var(--text-muted)" : "var(--color-expense)",
                cursor: filteredTransactions.length === 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "all 0.2s ease",
              }}>
              <FileText size={16} /> PDF
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="dash-stat-grid">
          <SummaryCard title="Total Pemasukan" amount={totalIncome} type="income" loading={loading} periodLabel={periodLabel} />
          <SummaryCard title="Total Pengeluaran" amount={totalExpense} type="expense" loading={loading} periodLabel={periodLabel} />
          <SummaryCard title="Saldo Bersih" amount={balance} type="balance" loading={loading} periodLabel={periodLabel} />
        </div>

        {/* ── Chart + Transactions ── */}
        <div className="dash-content-grid">
          <div className="dash-chart-col">
            <CashFlowChart data={chartData} loading={loading} />
          </div>
          <div className="dash-txn-col">
            <RecentTransactions transactions={filteredTransactions} loading={loading} onDelete={handleDelete} periodLabel={periodLabel} />
          </div>
        </div>

      </div>

      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Default (Mobile First) */
        .dash-toolbar {
          flex-direction: column;
        }
        .export-actions {
          width: 100%;
        }
        .export-btn {
          flex: 1;
        }
        .dash-stat-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .dash-content-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .dash-chart-col, .dash-txn-col {
          width: 100%;
          min-width: 0;
        }
        @media (max-width: 480px) {
           .hide-on-mobile {
             display: none;
           }
        }

        /* Tablet & Desktop */
        @media (min-width: 768px) {
          .dash-stat-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .custom-date-group {
             width: auto !important;
          }
        }

        @media (min-width: 1024px) {
          .dash-toolbar {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .export-actions {
            width: auto;
          }
          .export-btn {
            flex: initial;
          }
          .dash-content-grid {
            flex-direction: row;
            align-items: flex-start;
            gap: 24px;
          }
          .dash-chart-col { flex: 2 1 0; }
          .dash-txn-col   { flex: 1 1 0; }
        }
      `}</style>
    </>
  );
}
