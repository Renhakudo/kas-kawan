"use client";

import { useState } from "react";
import { Camera, Mic, PenLine } from "lucide-react";
import { ReceiptScanner } from "@/components/input/ReceiptScanner";
import { VoiceInput } from "@/components/input/VoiceInput";
import { ManualInput } from "@/components/input/ManualInput";

const tabs = [
  { id: "scan", label: "Scan Struk", icon: Camera },
  { id: "voice", label: "Input Suara", icon: Mic },
  { id: "manual", label: "Manual", icon: PenLine },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function InputPage() {
  const [activeTab, setActiveTab] = useState<TabId>("manual");

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
      {activeTab === "scan" && <ReceiptScanner />}
      {activeTab === "voice" && <VoiceInput />}
      {activeTab === "manual" && <ManualInput />}
    </div>
  );
}
