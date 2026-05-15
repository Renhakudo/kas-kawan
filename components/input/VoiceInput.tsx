"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2, Save, CheckCircle, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { ParsedTransaction } from "@/lib/types";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

export function VoiceInput({ walletId }: { walletId?: string }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedTransaction | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) setSupported(false);
    }
  }, []);

  const startRecording = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SR();
    recognition.lang = "id-ID";
    recognition.continuous = false;
    recognition.interimResults = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      setTranscript(e.results[e.results.length - 1][0].transcript);
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => { setRecording(false); toast.error("Mikrofon tidak dapat diakses."); };
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
    setTranscript("");
    setParsed(null);
    setError(null);
  };

  const stopRecording = () => { recognitionRef.current?.stop(); setRecording(false); };

  const handleParse = async () => {
    if (!transcript.trim()) return;
    setParsing(true); setError(null);
    try {
      const res = await fetch("/api/parse-voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses");
      setParsed(data.parsed);
      toast.success("Berhasil diproses!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
      setError(msg); toast.error(msg);
    } finally { setParsing(false); }
  };

  const handleSave = async () => {
    if (!parsed) return;
    setSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet_id: walletId, type: parsed.type, amount: parsed.amount, category: parsed.category, description: parsed.description, transaction_date: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      toast.success("Transaksi tersimpan! 🎉");
      setTranscript(""); setParsed(null);
    } catch { toast.error("Gagal menyimpan"); } finally { setSaving(false); }
  };

  if (!supported) {
    return (
      <div className="glass-card" style={{ padding: 32, textAlign: "center" }}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>🎙️</p>
        <h3 style={{ fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>Browser Tidak Mendukung</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Gunakan Chrome atau Edge terbaru.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
        <button
          id="mic-button"
          onClick={recording ? stopRecording : startRecording}
          style={{
            width: 96, height: 96, borderRadius: "50%",
            background: recording ? "linear-gradient(135deg, var(--color-expense), var(--color-expense-border))" : "linear-gradient(135deg, var(--accent), var(--accent-dark))",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: recording ? "0 0 0 12px var(--color-expense-bg), 0 8px 32px var(--color-expense-border)" : "0 8px 32px var(--accent-glow)",
            transition: "all 0.3s ease",
          }}
        >
          {recording ? <MicOff size={40} color="white" /> : <Mic size={40} color="white" />}
        </button>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "var(--text-primary)" }}>
          {recording ? "🔴 Sedang Merekam..." : "Tekan untuk bicara"}
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          {recording ? "Ucapkan transaksi, klik lagi untuk berhenti" : 'Contoh: "Beli bahan baku 250 ribu"'}
        </p>
      </div>

      {transcript && (
        <div className="glass-card" style={{ padding: 20 }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 600 }}>HASIL REKAMAN:</p>
          <p style={{ fontSize: 16, fontStyle: "italic", color: "var(--text-primary)" }}>"{transcript}"</p>
        </div>
      )}

      {error && (
        <div style={{ display: "flex", gap: 10, background: "var(--color-expense-bg)", border: "1px solid var(--color-expense-border)", borderRadius: 10, padding: "12px 16px", color: "var(--color-expense)", fontSize: 14 }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />{error}
        </div>
      )}

      {transcript && !parsed && !recording && (
        <button id="parse-voice-btn" onClick={handleParse} disabled={parsing} className="btn-primary"
          style={{ fontSize: 15, padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {parsing ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Memproses...</> : <><Mic size={18} /> Proses Transaksi</>}
        </button>
      )}

      {parsed && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <CheckCircle size={20} color="var(--accent)" />
            <h3 style={{ fontWeight: 700, color: "var(--text-primary)" }}>Hasil AI</h3>
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
            <button onClick={() => { setParsed(null); setTranscript(""); }} className="btn-secondary"
              style={{ flex: 1, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <X size={15} /> Ulang
            </button>
            <button id="save-voice-btn" onClick={handleSave} disabled={saving} className="btn-primary"
              style={{ flex: 2, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {saving ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={15} />}
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
