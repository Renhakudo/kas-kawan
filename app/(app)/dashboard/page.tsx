"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import type { Transaction, ChartDataPoint } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { RefreshCw, PlusCircle, Sun, Download, Calendar } from "lucide-react";
import Link from "next/link";

type PeriodFilter = "today" | "week" | "month" | "year" | "all" | "custom";

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "week", label: "Minggu Ini" },
  { value: "month", label: "Bulan Ini" },
  { value: "year", label: "Tahun Ini" },
  { value: "all", label: "Semua Data" },
  { value: "custom", label: "Pilih Tanggal" },
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
      const day = now.getDay(); // 0 = Sunday
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
    // Hourly breakdown
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

  // "all" — last 30 days
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
    const desc = t.description ? `"${t.description.replace(/"/g, '""')}"` : "";
    return `"${t.id}","${date}","${time}","${tipe}","${t.category}","${t.amount}",${desc}`;
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
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

export default function DashboardPage() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      const [{ data: { session } }, transRes] = await Promise.all([
        supabase.auth.getSession(),
        fetch("/api/transactions"),
      ]);

      const user = session?.user;
      if (user) {
        setUserName(
          user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "Sobat"
        );
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
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
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

  const handleDownloadCSV = () => {
    exportToCSV(filteredTransactions, periodLabel);
  };

  return (
    <div style={{ padding: "32px 28px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Sun size={18} color="hsl(38 92% 50%)" />
            <span style={{ fontSize: 14, color: "hsl(215 20% 60%)", fontWeight: 500 }}>
              {getGreeting()},
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            {loading ? "..." : userName} 👋
          </h1>
          <p style={{ color: "hsl(215 20% 55%)", marginTop: 4, fontSize: 14 }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={handleRefresh}
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, padding: "9px 16px" }}
          >
            <RefreshCw size={15} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
          <Link href="/input">
            <button
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, padding: "9px 16px" }}
            >
              <PlusCircle size={15} />
              Catat Baru
            </button>
          </Link>
        </div>
      </div>

      {/* Period Filter + Download Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
          padding: "14px 18px",
          borderRadius: 14,
          background: "hsl(220 20% 10%)",
          border: "1px solid hsl(220 20% 18%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Calendar size={16} color="hsl(217 91% 60%)" />
          <span style={{ fontSize: 13, color: "hsl(215 20% 60%)", fontWeight: 500 }}>Periode:</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid hsl(220 20% 22%)",
                background: "hsl(220 20% 10%)",
                color: "white",
                fontSize: 13,
                fontFamily: "inherit",
                cursor: "pointer",
                outline: "none"
              }}
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {period === "custom" && (
              <>
                <input 
                  type="date" 
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid hsl(220 20% 22%)", background: "hsl(220 20% 10%)", color: "white", fontSize: 13, colorScheme: "dark" }}
                />
                <span style={{ color: "hsl(215 20% 55%)" }}>-</span>
                <input 
                  type="date" 
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid hsl(220 20% 22%)", background: "hsl(220 20% 10%)", color: "white", fontSize: 13, colorScheme: "dark" }}
                />
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleDownloadCSV}
          disabled={filteredTransactions.length === 0}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid hsl(142 71% 45% / 0.4)",
            background: filteredTransactions.length === 0
              ? "hsl(220 20% 14%)"
              : "hsl(142 71% 45% / 0.12)",
            color: filteredTransactions.length === 0
              ? "hsl(215 20% 35%)"
              : "hsl(142 71% 55%)",
            fontSize: 13,
            fontWeight: 600,
            cursor: filteredTransactions.length === 0 ? "not-allowed" : "pointer",
            transition: "all 0.15s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            if (filteredTransactions.length > 0) {
              e.currentTarget.style.background = "hsl(142 71% 45% / 0.22)";
            }
          }}
          onMouseLeave={(e) => {
            if (filteredTransactions.length > 0) {
              e.currentTarget.style.background = "hsl(142 71% 45% / 0.12)";
            }
          }}
          title={filteredTransactions.length === 0 ? "Tidak ada data untuk diunduh" : `Unduh ${filteredTransactions.length} transaksi sebagai CSV`}
        >
          <Download size={14} />
          Unduh CSV
          {filteredTransactions.length > 0 && (
            <span
              style={{
                marginLeft: 4,
                padding: "1px 7px",
                borderRadius: 10,
                background: "hsl(142 71% 45% / 0.25)",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {filteredTransactions.length}
            </span>
          )}
        </button>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <SummaryCard
          title="Total Pemasukan"
          amount={totalIncome}
          type="income"
          loading={loading}
          periodLabel={periodLabel}
        />
        <SummaryCard
          title="Total Pengeluaran"
          amount={totalExpense}
          type="expense"
          loading={loading}
          periodLabel={periodLabel}
        />
        <SummaryCard
          title="Saldo Bersih"
          amount={balance}
          type="balance"
          loading={loading}
          periodLabel={periodLabel}
        />
      </div>

      {/* Chart + Transactions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
        <CashFlowChart data={chartData} loading={loading} />
        <RecentTransactions
          transactions={filteredTransactions}
          loading={loading}
          onDelete={handleDelete}
          periodLabel={periodLabel}
        />
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
