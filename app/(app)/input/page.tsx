"use client";

import { useState, useEffect } from "react";
import { Camera, Mic, PenLine, Wallet } from "lucide-react";
import { ReceiptScanner } from "@/components/input/ReceiptScanner";
import { VoiceInput } from "@/components/input/VoiceInput";
import { ManualInput } from "@/components/input/ManualInput";
import { createClient } from "@/lib/supabase/client";

type WalletType = {
  id: string;
  name: string;
  is_primary: boolean;
};

const tabs = [
  { id: "scan", label: "Scan Struk", icon: Camera },
  { id: "voice", label: "Input Suara", icon: Mic },
  { id: "manual", label: "Manual", icon: PenLine },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function InputPage() {
  const [activeTab, setActiveTab] = useState<TabId>("manual");
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    const fetchWallets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (data && data.length > 0) {
        // Deduplicate wallets by id
        const unique = data.filter(
          (w: WalletType, i: number, arr: WalletType[]) =>
            arr.findIndex((x) => x.id === w.id) === i
        );
        setWallets(unique);
        const primary = unique.find((w: WalletType) => w.is_primary) || unique[0];
        setSelectedWalletId(primary.id);
      }
    };
    fetchWallets();
  }, [supabase]);

  return (
    <div style={{ padding: "32px 28px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Catat Transaksi
        </h1>
        <p style={{ color: "hsl(215 20% 55%)", marginTop: 6, fontSize: 14 }}>
          Pilih metode pencatatan yang paling mudah untuk Anda
        </p>
      </div>

      {/* Wallet Selector — always visible */}
      {wallets.length > 0 && (
        <div
          style={{
            marginBottom: 20,
            padding: "14px 16px",
            background: "hsl(220 20% 10%)",
            border: "1px solid hsl(220 20% 20%)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "hsl(217 91% 60% / 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Wallet size={18} color="hsl(217 91% 65%)" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: "hsl(215 20% 50%)", fontWeight: 600, marginBottom: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Catat ke Dompet
            </p>
            {wallets.length === 1 ? (
              <p style={{ fontSize: 15, fontWeight: 700, color: "white" }}>
                {wallets[0].name}
                {wallets[0].is_primary && (
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: "hsl(217 91% 65%)", background: "hsl(217 91% 60% / 0.15)", padding: "2px 8px", borderRadius: 20 }}>
                    Utama
                  </span>
                )}
              </p>
            ) : (
              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid hsl(220 20% 25%)",
                  background: "hsl(220 20% 14%)",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}{w.is_primary ? " (Utama)" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          background: "hsl(220 20% 10%)",
          border: "1px solid hsl(220 20% 18%)",
          borderRadius: 12,
          padding: 6,
          marginBottom: 24,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 600 : 500,
              transition: "all 0.2s",
              background:
                activeTab === tab.id
                  ? "linear-gradient(135deg, hsl(142 71% 45%), hsl(161 94% 30%))"
                  : "transparent",
              color: activeTab === tab.id ? "white" : "hsl(215 20% 55%)",
              boxShadow: activeTab === tab.id ? "0 2px 12px hsl(142 71% 45% / 0.3)" : "none",
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "scan" && <ReceiptScanner walletId={selectedWalletId} />}
      {activeTab === "voice" && <VoiceInput walletId={selectedWalletId} />}
      {activeTab === "manual" && <ManualInput walletId={selectedWalletId} />}
    </div>
  );
}
