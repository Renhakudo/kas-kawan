"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Loader2, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
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

  // Tambahkan setValue di sini
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
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

  const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 } as const;
  const errStyle = { fontSize: 12, color: "var(--color-expense)", marginTop: 4 } as const;

  return (
    <div className="glass-card" style={{ padding: "clamp(20px, 4vw, 28px)" }}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* ── Tipe Transaksi (Responsive) ── */}
        <div>
          <label style={labelStyle}>Tipe Transaksi</label>
          <div className="transaction-type-wrapper">
            
            {/* 1. TAMPILAN DESKTOP (BUTTONS) */}
            <div className="type-desktop-buttons">
              <button
                type="button"
                onClick={() => setValue("type", "expense")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px",
                  borderRadius: "12px", border: txType === "expense" ? "2px solid var(--color-expense)" : "1px solid var(--border)",
                  background: txType === "expense" ? "var(--color-expense-bg)" : "transparent",
                  color: txType === "expense" ? "var(--color-expense)" : "var(--text-muted)",
                  fontWeight: txType === "expense" ? 800 : 600,
                  fontSize: "14px", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                <TrendingDown size={18} /> Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setValue("type", "income")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px",
                  borderRadius: "12px", border: txType === "income" ? "2px solid var(--color-income)" : "1px solid var(--border)",
                  background: txType === "income" ? "var(--color-income-bg)" : "transparent",
                  color: txType === "income" ? "var(--color-income)" : "var(--text-muted)",
                  fontWeight: txType === "income" ? 800 : 600,
                  fontSize: "14px", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                <TrendingUp size={18} /> Pemasukan
              </button>
            </div>

            {/* 2. TAMPILAN MOBILE (DROPDOWN) */}
            <div className="type-mobile-dropdown" style={{ position: "relative" }}>
              <select
                {...register("type")}
                style={{
                  width: "100%",
                  padding: "12px 36px 12px 16px",
                  borderRadius: "12px",
                  border: txType === "income" ? "2px solid var(--color-income)" : "2px solid var(--color-expense)",
                  background: txType === "income" ? "var(--color-income-bg)" : "var(--color-expense-bg)",
                  color: txType === "income" ? "var(--color-income)" : "var(--color-expense)",
                  fontSize: "15px",
                  fontWeight: 800,
                  fontFamily: "inherit",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                }}
              >
                <option value="expense">📉 Pengeluaran</option>
                <option value="income">📈 Pemasukan</option>
              </select>
              <ChevronDown 
                size={18} 
                color={txType === "income" ? "var(--color-income)" : "var(--color-expense)"} 
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} 
              />
            </div>
          </div>
        </div>


        {/* Date */}
        <div>
          <label htmlFor="manual-date" style={labelStyle}>Tanggal</label>
          <input id="manual-date" className="input-field" type="date" {...register("transaction_date")} />
          {errors.transaction_date && <p style={errStyle}>{errors.transaction_date.message}</p>}
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

        <button
          id="manual-save-btn"
          type="submit"
          disabled={saving}
          className="btn-primary"
          style={{ fontSize: 15, padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: "8px" }}
        >
          {saving ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Menyimpan...</> : <><Save size={18} /> Simpan Transaksi</>}
        </button>
      </form>

      {/* ── CSS RESPONSIVE MAGIC ── */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        /* Default: Tampilkan Buttons (Desktop), Sembunyikan Dropdown */
        .type-desktop-buttons {
          display: flex;
          gap: 12px;
        }
        .type-mobile-dropdown {
          display: none;
        }

        /* Kalau Layar Mengecil (HP <= 480px) */
        @media (max-width: 480px) {
          .type-desktop-buttons {
            display: none !important;
          }
          .type-mobile-dropdown {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
