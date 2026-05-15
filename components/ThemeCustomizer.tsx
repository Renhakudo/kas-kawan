"use client";

import { useState, useEffect } from "react";
import { Palette, X, RotateCcw, Pipette, Sun, Moon } from "lucide-react";

// Predefined palette matches typical UI swatches
const SWATCHES = [
  "#ffffff", "#8b5cf6", "#0ea5e9", "#4f46e5", "#ef4444", 
  "#f97316", "#3b82f6", "#a855f7", "#10b981", "#14b8a6", 
  "#be185d", "#0f172a", "#451a03", "#2563eb", "#65a30d"
];

const TEXT_SWATCHES = [
  "#ffffff", "#f8fafc", "#e2e8f0", "#94a3b8", "#64748b",
  "#475569", "#334155", "#1e293b", "#0f172a", "#020617"
];

type ThemeState = {
  theme: "dark" | "light";
  primary: string;
  text: string;
  accent: string;
  secondary: string;
};

const DEFAULT_THEME: ThemeState = {
  theme: "light",
  primary: "#3b82f6", // Default Blue
  text: "#0f172a", // Dark text
  accent: "#f97316", // Orange accent
  secondary: "#ffffff", // Light sidebar
};

function hexToHsl(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function applyTheme(state: ThemeState) {
  const root = document.documentElement;

  // Background Theme
  if (state.theme === "light") {
    root.style.setProperty("--bg-page", "#f8fafc");
    root.style.setProperty("--bg-card", "#ffffff");
    root.style.setProperty("--bg-elevated", "#f1f5f9");
    root.style.setProperty("--bg-input", "#ffffff");
    root.style.setProperty("--border", "#e2e8f0");
    root.style.setProperty("--border-light", "#cbd5e1");
    // Ensure text defaults to dark if light mode
    root.style.setProperty("--text-primary", state.text === "#f8fafc" || state.text === "#ffffff" ? "#0f172a" : state.text);
    root.style.setProperty("--text-secondary", "#475569");
    root.style.setProperty("--text-muted", "#64748b");
    root.style.setProperty("--sidebar-bg", state.secondary);
    root.style.setProperty("--sidebar-border", "#e2e8f0");
  } else {
    root.style.setProperty("--bg-page", "hsl(220 25% 6%)");
    root.style.setProperty("--bg-card", "hsl(222 28% 10%)");
    root.style.setProperty("--bg-elevated", "hsl(222 28% 13%)");
    root.style.setProperty("--bg-input", "hsl(222 30% 11%)");
    root.style.setProperty("--border", "hsl(222 25% 16%)");
    root.style.setProperty("--border-light", "hsl(222 25% 20%)");
    root.style.setProperty("--text-primary", state.text);
    root.style.setProperty("--text-secondary", "hsl(215 20% 64%)");
    root.style.setProperty("--text-muted", "hsl(215 20% 44%)");
    root.style.setProperty("--sidebar-bg", state.secondary);
    root.style.setProperty("--sidebar-border", "hsl(222 30% 14%)");
  }

  // Primary Color -> maps to --accent
  const primaryHsl = hexToHsl(state.primary);
  root.style.setProperty("--accent-h", String(primaryHsl.h));
  root.style.setProperty("--accent-s", `${primaryHsl.s}%`);
  root.style.setProperty("--accent-l", `${primaryHsl.l}%`);
  root.style.setProperty("--accent", `hsl(${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%)`);
  root.style.setProperty("--accent-light", `hsl(${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l + 15}%)`);
  root.style.setProperty("--accent-dark", `hsl(${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l - 15}%)`);
  root.style.setProperty("--accent-glow", `hsl(${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}% / 0.25)`);
  root.style.setProperty("--accent-muted", `hsl(${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}% / 0.12)`);

  // Accent Color -> maps to an alternative accent or secondary highlighting
  root.style.setProperty("--color-balance", state.accent);
  root.style.setProperty("--color-balance-bg", `${state.accent}22`); // hex alpha
  root.style.setProperty("--color-balance-border", `${state.accent}44`);
  
  // Secondary Color -> mapped above to --sidebar-bg
  if (state.theme === "dark") {
    root.style.setProperty("--sidebar-bg", state.secondary);
  } else {
    root.style.setProperty("--sidebar-bg", state.secondary); 
  }
}

export function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const [themeState, setThemeState] = useState<ThemeState>(DEFAULT_THEME);

  useEffect(() => {
    const saved = localStorage.getItem("kk-theme-v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThemeState(parsed);
        applyTheme(parsed);
      } catch { /* ignore */ }
    } else {
      applyTheme(DEFAULT_THEME);
    }
  }, []);

  const updateTheme = (key: keyof ThemeState, value: string) => {
    const nextState = { ...themeState, [key]: value };
    setThemeState(nextState);
    applyTheme(nextState);
    localStorage.setItem("kk-theme-v2", JSON.stringify(nextState));
  };

  const resetTheme = () => {
    setThemeState(DEFAULT_THEME);
    applyTheme(DEFAULT_THEME);
    localStorage.removeItem("kk-theme-v2");
  };

  const ColorGrid = ({ title, field, swatches }: { title: string, field: keyof ThemeState, swatches: string[] }) => {
    const isCustomColor = !swatches.includes(themeState[field]);

    return (
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
          {swatches.map(hex => (
            <button
              key={hex}
              onClick={() => updateTheme(field, hex)}
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: 10, // Sudut dibikin lebih membulat
                background: hex,
                border: themeState[field] === hex ? "2px solid var(--text-primary)" : "1px solid var(--border)",
                transform: themeState[field] === hex ? "scale(1.15)" : "scale(1)",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                cursor: "pointer",
                boxShadow: themeState[field] === hex ? "0 8px 16px rgba(0,0,0,0.15)" : "none",
                ...(hex === "#ffffff" ? { border: themeState[field] === hex ? "2px solid var(--text-primary)" : "1px solid #cbd5e1" } : {})
              }}
              title={hex}
            />
          ))}

          {/* Tombol Native Color Picker */}
          <label
            title="Pilih Warna Kustom"
            style={{
              width: "100%",
              aspectRatio: "1",
              borderRadius: 10,
              background: isCustomColor ? themeState[field] : "var(--bg-elevated)",
              border: isCustomColor ? "2px solid var(--text-primary)" : "1px dashed var(--text-muted)",
              transform: isCustomColor ? "scale(1.15)" : "scale(1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: isCustomColor ? "0 8px 16px rgba(0,0,0,0.15)" : "none",
            }}
          >
            {/* Input color asli disembunyikan pakai opacity 0 tapi tetap bisa di-klik full */}
            <input
              type="color"
              value={themeState[field]}
              onChange={(e) => updateTheme(field, e.target.value)}
              style={{
                opacity: 0,
                position: "absolute",
                inset: 0,
                width: "200%", // Melebar untuk menghindari padding bawaan browser
                height: "200%",
                top: "-50%",
                left: "-50%",
                cursor: "pointer"
              }}
            />
            {/* Ikon Pipet untuk indikator "Custom Color" */}
            <Pipette 
              size={16} 
              color={isCustomColor ? "white" : "var(--text-muted)"} 
              style={{ 
                position: "relative", 
                zIndex: 1, 
                mixBlendMode: isCustomColor ? "difference" : "normal" 
              }} 
            />
          </label>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        title="Kustomisasi Tampilan"
        style={{
          position: "fixed",
          right: open ? 340 : 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 200,
          width: 48,
          height: 48,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRight: open ? "none" : "1px solid var(--border)",
          borderRadius: "16px 0 0 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.1)",
        }}
      >
        <Palette size={20} color="var(--text-primary)" />
      </button>

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          right: open ? 0 : -340,
          top: 0,
          bottom: 0,
          width: 340,
          background: "var(--bg-card)",
          borderLeft: "1px solid var(--border)",
          zIndex: 199,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-12px 0 48px rgba(0,0,0,0.2)",
          transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <p style={{ fontWeight: 800, fontSize: 18, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Kustomisasi Tema</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={resetTheme} title="Kembalikan Default" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: 8, color: "var(--text-muted)", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
              <RotateCcw size={16} />
            </button>
            <button onClick={() => setOpen(false)} title="Tutup" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: 8, color: "var(--text-muted)", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          
          {/* Background Toggle (Segmented Control Mode) */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Warna Background</p>
            <div style={{ display: "flex", background: "var(--bg-elevated)", padding: "6px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <button
                onClick={() => updateTheme("theme", "light")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px",
                  borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "14px", fontFamily: "inherit",
                  background: themeState.theme === "light" ? "var(--bg-card)" : "transparent",
                  color: themeState.theme === "light" ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: themeState.theme === "light" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                <Sun size={16} /> Terang
              </button>
              <button
                onClick={() => updateTheme("theme", "dark")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px",
                  borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "14px", fontFamily: "inherit",
                  background: themeState.theme === "dark" ? "var(--bg-card)" : "transparent",
                  color: themeState.theme === "dark" ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: themeState.theme === "dark" ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                <Moon size={16} /> Gelap
              </button>
            </div>
          </div>

          <ColorGrid title="Warna Utama (Brand)" field="primary" swatches={SWATCHES} />
          <ColorGrid title="Warna Teks Utama" field="text" swatches={TEXT_SWATCHES} />
          <ColorGrid title="Warna Aksen" field="accent" swatches={SWATCHES} />
          <ColorGrid title="Warna Sidebar / Menu" field="secondary" swatches={SWATCHES} />

        </div>
      </div>
    </>
  );
}
