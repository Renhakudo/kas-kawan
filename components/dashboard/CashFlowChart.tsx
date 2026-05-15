"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ChartDataPoint } from "@/lib/types";
import { TrendingUp } from "lucide-react";

interface CashFlowChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

function formatK(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
  return value.toString();
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          minWidth: "180px",
        }}
      >
        <p style={{ color: "var(--text-muted)", marginBottom: "12px", fontWeight: 800, fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
          {label}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {payload.map((entry) => (
            <div key={entry.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: entry.color, flexShrink: 0 }} />
                <span style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600 }}>{entry.name}</span>
              </div>
              <span style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "13px" }}>
                Rp {new Intl.NumberFormat("id-ID").format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: { payload?: Array<{ color: string; value: string }> }) => (
  <div style={{ display: "flex", gap: "24px", justifyContent: "flex-end", padding: "12px 0 0" }}>
    {payload?.map((entry) => (
      <div key={entry.value} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "12px", height: "12px", borderRadius: "4px", background: entry.color }} />
        <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>{entry.value}</span>
      </div>
    ))}
  </div>
);

export function CashFlowChart({ data, loading }: CashFlowChartProps) {
  if (loading) {
    return (
      <div className="glass-card" style={{ padding: "32px", borderRadius: "24px", minHeight: "400px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "20px", marginBottom: "32px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div className="skeleton" style={{ height: "56px", width: "56px", borderRadius: "16px" }} />
            <div>
              <div className="skeleton" style={{ height: "20px", width: "120px", marginBottom: "8px", borderRadius: "4px" }} />
              <div className="skeleton" style={{ height: "14px", width: "180px", borderRadius: "4px" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <div className="skeleton" style={{ height: "56px", width: "120px", borderRadius: "12px" }} />
            <div className="skeleton" style={{ height: "56px", width: "120px", borderRadius: "12px" }} />
          </div>
        </div>
        <div className="skeleton" style={{ height: "280px", width: "100%", borderRadius: "16px" }} />
      </div>
    );
  }

  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpense = data.reduce((s, d) => s + d.expense, 0);
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <div className="glass-card" style={{ padding: "clamp(16px, 4vw, 28px)", borderRadius: "24px", overflow: "hidden", minWidth: 0 }}>
      
      {/* --- HEADER & SUMMARY --- */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        
        {/* Title Area */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-card)" }}>
            <TrendingUp size={28} color="var(--accent)" />
          </div>
          <div>
            <h3 style={{ fontWeight: 900, fontSize: "20px", color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "4px" }}>
              Arus Kas
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
              Perbandingan total pemasukan dan pengeluaran
            </p>
          </div>
        </div>

        {/* Summary Boxes (Hanya muncul jika ada data) */}
        {hasData && (
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", background: "var(--bg-elevated)", border: "1px solid var(--border)", padding: "10px 14px", borderRadius: "12px", flex: "1 1 100px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px", marginBottom: "4px" }}>
                Total Pemasukan
              </span>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--color-income)" }}>
                +{formatK(totalIncome)}
              </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", background: "var(--bg-elevated)", border: "1px solid var(--border)", padding: "10px 14px", borderRadius: "12px", flex: "1 1 100px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px", marginBottom: "4px" }}>
                Total Pengeluaran
              </span>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--color-expense)" }}>
                -{formatK(totalExpense)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* --- CHART AREA --- */}
      {!hasData ? (
        // Modern Empty State
        <div style={{ height: "280px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: "var(--bg-elevated)", borderRadius: "16px", border: "1px dashed var(--border)" }}>
          <div style={{ width: "56px", height: "56px", background: "var(--bg-card)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
            <TrendingUp size={24} color="var(--text-muted)" />
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", fontWeight: 600 }}>Belum ada data transaksi untuk periode ini</p>
        </div>
      ) : (
        <div style={{ height: "280px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-income)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-income)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-expense)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-expense)" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
              
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--text-secondary)", fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                interval="preserveStartEnd"
              />
              
              <YAxis
                tickFormatter={formatK}
                tick={{ fill: "var(--text-secondary)", fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                width={50}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border-light)", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Legend content={<CustomLegend />} verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: "20px" }} />
              
              {/* StrokeWidth dinaikkan ke 3 biar garis grafiknya bold dan kokoh */}
              <Area
                type="monotone"
                dataKey="income"
                name="Pemasukan"
                stroke="var(--chart-income)"
                strokeWidth={3}
                fill="url(#incomeGrad)"
                dot={false}
                activeDot={{ r: 6, fill: "var(--chart-income)", stroke: "var(--bg-card)", strokeWidth: 3 }}
              />
              
              <Area
                type="monotone"
                dataKey="expense"
                name="Pengeluaran"
                stroke="var(--chart-expense)"
                strokeWidth={3}
                fill="url(#expenseGrad)"
                dot={false}
                activeDot={{ r: 6, fill: "var(--chart-expense)", stroke: "var(--bg-card)", strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
