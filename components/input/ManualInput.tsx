"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES_INCOME = ["Penjualan", "Jasa", "Investasi", "Lainnya (Masuk)"];
const CATEGORIES_EXPENSE = ["Bahan Baku", "Gaji Karyawan", "Sewa", "Listrik & Air", "Transport", "Makanan & Minuman", "Peralatan", "Marketing", "Lainnya (Keluar)"];

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Nominal wajib diisi").refine((v) => !isNaN(Number(v.replace(/\./g, "").replace(",", "."))) && Number(v.replace(/\./g, "")) > 0, "Nominal harus lebih dari 0"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  description: z.string().optional(),
  transaction_date: z.string().min(1, "Tanggal wajib diisi"),
});

type FormData = z.infer<typeof schema>;

export function ManualInput({ walletId }: { walletId?: string }) {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      transaction_date: new Date().toISOString().split("T")[0],
    },
  });

  const txType = watch("type");
  const categories = txType === "income" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const amount = parseFloat(data.amount.replace(/\./g, "").replace(",", "."));
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_id: walletId,
          type: data.type,
          amount,
          category: data.category,
          description: data.description || null,
          transaction_date: new Date(data.transaction_date).toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      toast.success("Transaksi berhasil disimpan! 🎉");
      reset({ type: "expense", transaction_date: new Date().toISOString().split("T")[0] });
    } catch {
      toast.error("Gagal menyimpan transaksi");
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: "hsl(215 20% 65%)", marginBottom: 6 } as const;
  const errStyle = { fontSize: 12, color: "hsl(0 72% 65%)", marginTop: 4 } as const;

  return (
    <div className="glass-card" style={{ padding: 28 }}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Type Toggle */}
        <div>
          <label style={labelStyle}>Tipe Transaksi</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {(["expense", "income"] as const).map((t) => (
              <label
                key={t}
                htmlFor={`type-${t}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  border: `1px solid ${txType === t ? (t === "income" ? "hsl(142 71% 45% / 0.5)" : "hsl(0 72% 51% / 0.5)") : "hsl(220 20% 22%)"}`,
                  background: txType === t ? (t === "income" ? "hsl(142 71% 45% / 0.1)" : "hsl(0 72% 51% / 0.1)") : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <input id={`type-${t}`} type="radio" value={t} {...register("type")} style={{ display: "none" }} />
                {t === "income" ? <TrendingUp size={18} color="hsl(142 71% 55%)" /> : <TrendingDown size={18} color="hsl(0 72% 65%)" />}
                <span style={{ fontWeight: 600, fontSize: 14, color: txType === t ? (t === "income" ? "hsl(142 71% 65%)" : "hsl(0 72% 70%)") : "hsl(215 20% 60%)" }}>
                  {t === "income" ? "Pemasukan" : "Pengeluaran"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="manual-amount" style={labelStyle}>Nominal (Rp)</label>
          <input
            id="manual-amount"
            className="input-field"
            type="number"
            placeholder="contoh: 150000"
            {...register("amount")}
          />
          {errors.amount && <p style={errStyle}>{errors.amount.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="manual-category" style={labelStyle}>Kategori</label>
          <select id="manual-category" className="input-field" {...register("category")}>
            <option value="">-- Pilih kategori --</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p style={errStyle}>{errors.category.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="manual-desc" style={labelStyle}>Keterangan (opsional)</label>
          <textarea
            id="manual-desc"
            className="input-field"
            placeholder="Catatan tambahan..."
            rows={2}
            {...register("description")}
            style={{ resize: "vertical", minHeight: 60 }}
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="manual-date" style={labelStyle}>Tanggal</label>
          <input id="manual-date" className="input-field" type="date" {...register("transaction_date")} />
          {errors.transaction_date && <p style={errStyle}>{errors.transaction_date.message}</p>}
        </div>

        <button
          id="manual-save-btn"
          type="submit"
          disabled={saving}
          className="btn-primary"
          style={{ fontSize: 15, padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {saving ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Menyimpan...</> : <><Save size={18} /> Simpan Transaksi</>}
        </button>
      </form>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
