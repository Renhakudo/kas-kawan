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

interface CashFlowChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

function formatK(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
  return value.toString();
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "hsl(220 20% 12%)",
          border: "1px solid hsl(220 20% 20%)",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 13,
        }}
      >
        <p style={{ color: "hsl(215 20% 60%)", marginBottom: 6, fontWeight: 600 }}>
          {label}
        </p>
        {payload.map((entry) => (
          <p
            key={entry.name}
            style={{ color: entry.color, marginBottom: 2, fontWeight: 500 }}
          >
            {entry.name}:{" "}
            <span style={{ color: "hsl(210 40% 90%)" }}>
              Rp {new Intl.NumberFormat("id-ID").format(entry.value)}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CashFlowChart({ data, loading }: CashFlowChartProps) {
  if (loading) {
    return (
      <div className="glass-card" style={{ padding: 24, height: 300 }}>
        <div className="skeleton" style={{ height: 20, width: "40%", marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 220, width: "100%" }} />
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16 }}>Arus Kas 30 Hari Terakhir</h3>
        <p style={{ fontSize: 13, color: "hsl(215 20% 55%)", marginTop: 4 }}>
          Perbandingan pemasukan dan pengeluaran harian
        </p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0 72% 51%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(0 72% 51%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(215 20% 50%)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatK}
            tick={{ fill: "hsl(215 20% 50%)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 13, color: "hsl(215 20% 60%)" }}
          />
          <Area
            type="monotone"
            dataKey="income"
            name="Pemasukan"
            stroke="hsl(142 71% 45%)"
            strokeWidth={2}
            fill="url(#incomeGrad)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Pengeluaran"
            stroke="hsl(0 72% 51%)"
            strokeWidth={2}
            fill="url(#expenseGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
