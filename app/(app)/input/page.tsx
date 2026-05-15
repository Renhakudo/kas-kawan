"use client";

import { useState } from "react";
import { Camera, Mic, PenLine, Wallet, ChevronDown } from "lucide-react";
import { ReceiptScanner } from "@/components/input/ReceiptScanner";
import { VoiceInput } from "@/components/input/VoiceInput";
import { ManualInput } from "@/components/input/ManualInput";
import { useWallet } from "@/components/WalletProvider";

const tabs = [
  { id: "scan", label: "Scan Struk", icon: Camera },
  { id: "voice", label: "Input Suara", icon: Mic },
  { id: "manual", label: "Manual", icon: PenLine },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function InputPage() {
  const [activeTab, setActiveTab] = useState<TabId>("manual");
  const { wallets, selectedWalletId, setSelectedWalletId } = useWallet();

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column" }}>
      
      {/* ── HEADER HALAMAN ── */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "6px" }}>
          Catat Transaksi
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "clamp(13px, 3vw, 15px)", fontWeight: 500 }}>
          Pilih metode pencatatan yang paling mudah untuk Anda.
        </p>
      </div>

      <div className="glass-card animate-fade-in-up" style={{ padding: "clamp(16px, 5vw, 40px)", borderRadius: "clamp(16px, 4vw, 24px)", background: "var(--bg-card)" }}>
        
        {/* ── WALLET SELECTOR ── */}
        {wallets.length > 0 && (
          <div className="wallet-selector-box">
            <div className="wallet-icon-box">
              <Wallet size={20} color="var(--color-balance)" className="wallet-icon" />
            </div>
            
            <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, marginBottom: "4px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Pilih Dompet Tujuan
              </p>
              
              {wallets.length === 1 ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <p style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {wallets[0].name}
                  </p>
                  {wallets[0].is_primary && (
                    <span style={{ flexShrink: 0, fontSize: "10px", fontWeight: 700, color: "var(--color-balance)", background: "var(--bg-card)", border: "1px solid var(--color-balance-border)", padding: "2px 6px", borderRadius: "100px" }}>
                      Utama
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <select
                    value={selectedWalletId}
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                    className="wallet-select-input"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} {w.is_primary ? " (Utama)" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} color="var(--text-muted)" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TABS (SEGMENTED CONTROL) DENGAN CSS GRID ── */}
        <div className="input-tabs-grid">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`input-tab-btn ${isActive ? "active" : ""}`}
              >
                <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="tab-icon" />
                <span className="tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── KONTEN INPUT ── */}
        <div style={{ minHeight: "300px", minWidth: 0 }}>
          {activeTab === "scan" && <ReceiptScanner walletId={selectedWalletId} />}
          {activeTab === "voice" && <VoiceInput walletId={selectedWalletId} />}
          {activeTab === "manual" && <ManualInput walletId={selectedWalletId} />}
        </div>
      </div>

      {/* ── CSS KHUSUS RESPONSIVE ── */}
      <style>{`
        /* Wallet Selector Styles */
        .wallet-selector-box {
          margin-bottom: 24px;
          padding: 16px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        .wallet-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--color-balance-bg);
          border: 1px solid var(--color-balance-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .wallet-select-input {
          width: 100%;
          padding: 8px 32px 8px 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-primary);
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          outline: none;
          cursor: pointer;
          appearance: none;
          transition: border-color 0.2s;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
        .wallet-select-input:focus {
          border-color: var(--accent);
        }

        /* ── KUNCI PERBAIKAN: CSS GRID UNTUK TABS ── */
        .input-tabs-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr)); /* Memaksa 3 kolom sama rata, anti meluber! */
          gap: 8px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 8px;
          margin-bottom: 32px;
        }

        .input-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 6px; /* Padding samping dikecilin biar text muat */
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          background: transparent;
          color: var(--text-secondary);
          width: 100%;
        }
        .input-tab-btn.active {
          font-weight: 800;
          background: var(--bg-card);
          color: var(--accent);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        /* ── MOBILE RESPONSIVE ── */
        @media (max-width: 480px) {
          .wallet-selector-box {
            padding: 12px;
            gap: 12px;
            border-radius: 14px;
          }
          .wallet-icon-box {
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }
          .wallet-select-input {
            font-size: 14px;
            padding: 6px 28px 6px 10px;
          }
          
          .input-tabs-grid {
            padding: 6px;
            border-radius: 14px;
            gap: 4px;
            margin-bottom: 24px;
          }
          
          /* Icon pindah ke atas teks di layar HP */
          .input-tab-btn {
            flex-direction: column;
            gap: 4px;
            padding: 8px 2px;
          }
          .tab-icon {
            width: 18px;
            height: 18px;
          }
          .tab-label {
            font-size: 11px;
            text-align: center;
            line-height: 1.2;
            white-space: nowrap; /* Mencegah teks turun baris */
          }
        }
      `}</style>
    </div>
  );
}
