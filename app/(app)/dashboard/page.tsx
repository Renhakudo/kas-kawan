"use client";

import { useEffect, useState, useCallback } from "react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import type { Transaction, ChartDataPoint } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { RefreshCw, PlusCircle, Sun } from "lucide-react";
import Link from "next/link";

function buildChartData(transactions: Transaction[]): ChartDataPoint[] {
  const today = new Date();
  const days: ChartDataPoint[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    const income = transactions
      .filter((t) => t.type === "income" && new Date(t.transaction_date) >= dayStart && new Date(t.transaction_date) < dayEnd)
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "expense" && new Date(t.transaction_date) >= dayStart && new Date(t.transaction_date) < dayEnd)
      .reduce((sum, t) => sum + t.amount, 0);

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

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [refreshing, setRefreshing] = useState(false);
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
        setTransactions(transactions || []);
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
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Calculate current month stats
  const now = new Date();
  const currentMonthTx = transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalIncome = currentMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = currentMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = buildChartData(transactions);
  const recent = transactions.slice(0, 10);

  return (
    <div style={{ padding: "32px 28px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
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

        <div style={{ display: "flex", gap: 10 }}>
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

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <SummaryCard title="Total Pemasukan" amount={totalIncome} type="income" loading={loading} />
        <SummaryCard title="Total Pengeluaran" amount={totalExpense} type="expense" loading={loading} />
        <SummaryCard title="Saldo Bersih" amount={balance} type="balance" loading={loading} />
      </div>

      {/* Chart + Transactions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
        <CashFlowChart data={chartData} loading={loading} />
        <RecentTransactions
          transactions={recent}
          loading={loading}
          onDelete={handleDelete}
        />
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
