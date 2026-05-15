"use client";

import { useWallet } from "./WalletProvider";
import { Wallet, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function GlobalWalletSwitcher() {
  const { wallets, selectedWalletId, setSelectedWalletId, loadingWallets } = useWallet();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeWallet = wallets.find(w => w.id === selectedWalletId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loadingWallets || wallets.length === 0) return null;

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {/* ── TOMBOL TRIGGER ── */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "6px 16px 6px 6px",
          borderRadius: "100px", // Bentuk Kapsul
          background: open ? "var(--bg-card)" : "var(--bg-elevated)",
          border: "1px solid",
          borderColor: open ? "var(--accent)" : "var(--border)",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.2s ease",
          boxShadow: open ? "0 4px 16px var(--accent-glow)" : "none",
        }}
        onMouseEnter={e => {
          if (!open) {
            e.currentTarget.style.background = "var(--bg-card)";
            e.currentTarget.style.borderColor = "var(--border-light)";
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.background = "var(--bg-elevated)";
            e.currentTarget.style.borderColor = "var(--border)";
          }
        }}
      >
        <div style={{ 
          width: "34px", 
          height: "34px", 
          borderRadius: "50%", 
          background: "var(--color-balance-bg)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          border: "1px solid var(--color-balance-border)",
          flexShrink: 0
        }}>
          <Wallet size={16} color="var(--color-balance)" />
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginRight: "4px" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: 1, marginBottom: "2px" }}>
            Dompet Aktif
          </span>
          <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
            {activeWallet?.name || "Pilih Dompet"}
          </span>
        </div>
        
        <ChevronDown 
          size={16} 
          color={open ? "var(--accent)" : "var(--text-muted)"} 
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", marginLeft: "2px" }} 
        />
      </button>

      {/* ── DROPDOWN MENU ── */}
      {open && (
        <div 
          className="animate-fade-in-up"
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            right: 0,
            minWidth: "260px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
            zIndex: 100,
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}
        >
          <p style={{ padding: "8px 12px 4px", fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
            Pilih Dompet
          </p>
          
          {wallets.map(w => {
            const isSelected = w.id === selectedWalletId;
            return (
              <button
                key={w.id}
                onClick={() => {
                  setSelectedWalletId(w.id);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px",
                  background: isSelected ? "var(--accent-muted)" : "transparent",
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--bg-elevated)"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ 
                  width: "38px", 
                  height: "38px", 
                  borderRadius: "12px", 
                  background: isSelected ? "var(--accent)" : "var(--bg-page)", 
                  border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  boxShadow: isSelected ? "0 4px 12px var(--accent-glow)" : "none",
                  flexShrink: 0
                }}>
                  <Wallet size={18} color={isSelected ? "white" : "var(--text-muted)"} />
                </div>
                
                <div style={{ flex: 1, textAlign: "left", display: "flex", flexDirection: "column" }}>
                  <p style={{ fontSize: "14px", fontWeight: 800, color: isSelected ? "var(--accent)" : "var(--text-primary)", marginBottom: "2px" }}>
                    {w.name}
                  </p>
                  {w.is_primary && (
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>Dompet Utama</span>
                  )}
                </div>
                
                {isSelected && (
                  <Check size={18} color="var(--accent)" strokeWidth={3} style={{ flexShrink: 0, marginRight: "4px" }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}