"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Camera, CheckCircle, AlertCircle, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import type { ParsedTransaction } from "@/lib/types";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

export function ReceiptScanner({ walletId }: { walletId?: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [parsed, setParsed] = useState<ParsedTransaction | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setParsed(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/scan-receipt", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memindai struk");
      setParsed(data.parsed);
      setReceiptUrl(data.receiptUrl);
      toast.success("Struk berhasil dibaca! Periksa dan simpan.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
      setError(msg);
      toast.error(msg);
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (!parsed) return;
    setSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_id: walletId,
          type: parsed.type,
          amount: parsed.amount,
          category: parsed.category,
          description: parsed.description,
          transaction_date: parsed.date ? new Date(parsed.date).toISOString() : new Date().toISOString(),
          receipt_image_url: receiptUrl,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      toast.success("Transaksi berhasil disimpan! 🎉");
      setFile(null);
      setPreview(null);
      setParsed(null);
      setReceiptUrl(null);
    } catch {
      toast.error("Gagal menyimpan transaksi");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setParsed(null);
    setError(null);
    setReceiptUrl(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Drop Zone & Take Picture */}
      {!preview ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 16,
              padding: "40px 24px",
              textAlign: "center",
              cursor: "pointer",
              background: isDragActive ? "var(--accent-muted)" : "var(--bg-elevated)",
              transition: "all 0.2s",
            }}
          >
            <input {...getInputProps()} id="receipt-drop-input" />
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "var(--color-balance-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Upload size={28} color="var(--color-balance)" />
            </div>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "var(--text-primary)" }}>
              {isDragActive ? "Lepaskan gambar di sini" : "Upload Foto Struk"}
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16 }}>
              Drag & drop, atau klik untuk pilih foto
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
              JPG, PNG, WEBP hingga 10MB
            </p>
          </div>

          <div style={{ position: "relative" }}>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                onDrop([f]);
              }}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: "pointer",
                width: "100%",
                height: "100%",
                zIndex: 10
              }}
            />
            <button
              className="btn-primary"
              style={{
                width: "100%",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 15,
                borderRadius: 16,
                background: "var(--accent)",
                color: "white",
                border: "none",
                fontWeight: 700,
                boxShadow: "0 4px 14px var(--accent-glow)"
              }}
            >
              <Camera size={20} />
              Ambil Gambar Langsung
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button
              onClick={handleReset}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
            >
              <X size={18} />
            </button>
          </div>
          <img
            src={preview}
            alt="Preview struk"
            style={{ width: "100%", borderRadius: 12, objectFit: "contain", maxHeight: 300 }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            background: "var(--color-expense-bg)",
            border: "1px solid var(--color-expense-border)",
            borderRadius: 10,
            padding: "12px 16px",
            color: "var(--color-expense)",
            fontSize: 14,
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          {error}
        </div>
      )}

      {/* Scan Button */}
      {preview && !parsed && (
        <button
          id="scan-receipt-btn"
          onClick={handleScan}
          disabled={scanning}
          className="btn-primary"
          style={{ fontSize: 15, padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {scanning ? (
            <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Memindai dengan AI...</>
          ) : (
            <><Camera size={18} /> Pindai Struk dengan Gemini AI</>
          )}
        </button>
      )}

      {/* Parsed Result */}
      {parsed && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <CheckCircle size={20} color="var(--accent)" />
            <h3 style={{ fontWeight: 700, color: "var(--text-primary)" }}>Hasil Pembacaan AI</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>Tipe</label>
              <select 
                value={parsed.type} 
                onChange={(e) => setParsed({ ...parsed, type: e.target.value as "income" | "expense" })}
                style={{ width: "100%", padding: "8px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontFamily: "inherit" }}
              >
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>Tanggal Transaksi</label>
              <input 
                type="date" 
                value={parsed.date?.split("T")[0] || new Date().toISOString().split("T")[0]} 
                onChange={(e) => setParsed({ ...parsed, date: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontFamily: "inherit" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>Nominal</label>
              <input 
                type="number" 
                value={parsed.amount} 
                onChange={(e) => setParsed({ ...parsed, amount: Number(e.target.value) })}
                style={{ width: "100%", padding: "8px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontFamily: "inherit" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>Kategori</label>
              <input 
                type="text" 
                value={parsed.category} 
                onChange={(e) => setParsed({ ...parsed, category: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontFamily: "inherit" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>Keterangan</label>
              <input 
                type="text" 
                value={parsed.description} 
                onChange={(e) => setParsed({ ...parsed, description: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontFamily: "inherit" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleReset} className="btn-secondary" style={{ flex: 1, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <X size={15} /> Ulang
            </button>
            <button
              id="save-receipt-btn"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              style={{ flex: 2, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              {saving ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={15} />}
              {saving ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
