"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

const QUICK_PROMPTS = [
  "Bagaimana kondisi keuangan bisnis saya bulan ini?",
  "Apakah pengeluaran saya terlalu tinggi minggu ini?",
  "Apa kategori pengeluaran terbesar saya?",
  "Berikan tips menghemat biaya operasional UMKM",
  "Bagaimana cara meningkatkan pemasukan saya?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Halo! Saya Kas Kawan, asisten keuangan AI Anda 👋\n\nSaya sudah membaca data transaksi Anda dan siap membantu menganalisis keuangan bisnis. Apa yang ingin Anda tanyakan?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMessage: ChatMessage = { role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();

      const reply = data.reply || "Maaf, saya tidak dapat merespons saat ini. Coba lagi ya!";
      setMessages((prev) => [...prev, { role: "assistant", content: reply, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Terjadi kesalahan koneksi. Silakan coba lagi.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "var(--bg-page)", color: "var(--text-primary)", fontFamily: "inherit" }}>
      
      {/* --- HEADER --- */}
      <div style={{ padding: "20px 5%", borderBottom: "1px solid var(--border)", background: "var(--bg-card)", zIndex: 10, boxShadow: "var(--shadow-sm)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--accent-light)" }}>
            <Bot size={24} color="var(--accent)" />
          </div>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.01em", color: "var(--text-primary)", marginBottom: "4px" }}>
              KasKawan AI
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-income)", animation: "pulse-glow 2s infinite" }} />
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>Online • Siap membantu</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- MESSAGES AREA --- */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 5%", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                animation: "fadeInUp 0.3s ease forwards",
              }}
            >
              {/* Avatar */}
              <div style={{
                width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
                background: msg.role === "user" ? "var(--color-income-bg)" : "var(--bg-card)",
                border: `1px solid ${msg.role === "user" ? "var(--color-income-border)" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: msg.role === "user" ? "none" : "var(--shadow-card)",
              }}>
                {msg.role === "user" ? <User size={20} color="var(--color-income)" /> : <Bot size={20} color="var(--accent)" />}
              </div>

              {/* Chat Bubble */}
              <div style={{
                maxWidth: "75%",
                padding: "16px 20px",
                borderRadius: msg.role === "user" ? "20px 4px 20px 20px" : "4px 20px 20px 20px",
                background: msg.role === "user" ? "var(--accent)" : "var(--bg-elevated)",
                border: msg.role === "user" ? "none" : "1px solid var(--border)",
                fontSize: "15px",
                lineHeight: 1.6,
                color: msg.role === "user" ? "white" : "var(--text-primary)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                boxShadow: msg.role === "user" ? "0 8px 24px var(--accent-glow)" : "none",
              }}>
                {msg.content}
                <p style={{ 
                  fontSize: "11px", 
                  opacity: 0.7, 
                  marginTop: "10px", 
                  textAlign: msg.role === "user" ? "right" : "left",
                  fontWeight: 500
                }}>
                  {msg.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading State */}
          {loading && (
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", animation: "fadeIn 0.3s ease forwards" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-card)" }}>
                <Bot size={20} color="var(--accent)" />
              </div>
              <div style={{ padding: "16px 20px", borderRadius: "4px 20px 20px 20px", background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
                <Loader2 size={18} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>KasKawan sedang menyusun laporan...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* --- QUICK PROMPTS & INPUT AREA --- */}
      <div style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", padding: "20px 5%", zIndex: 10 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          
          {/* Quick Prompts (Hanya muncul jika belum ada interaksi user) */}
          {messages.length <= 1 && (
            <div className="hidden-scrollbar" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "16px", marginBottom: "8px" }}>
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  style={{
                    padding: "10px 16px", 
                    borderRadius: "100px", 
                    border: "1px solid var(--border)",
                    background: "var(--bg-elevated)", 
                    color: "var(--text-secondary)", 
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer", 
                    fontFamily: "inherit", 
                    whiteSpace: "nowrap", 
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.borderColor = "var(--accent)"; 
                    e.currentTarget.style.color = "var(--accent)"; 
                    e.currentTarget.style.background = "var(--accent-muted)";
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.borderColor = "var(--border)"; 
                    e.currentTarget.style.color = "var(--text-secondary)"; 
                    e.currentTarget.style.background = "var(--bg-elevated)";
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "20px", padding: "8px 8px 8px 20px", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}>
            <Sparkles size={20} color="var(--accent)" style={{ flexShrink: 0 }} />
            <input
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Tanya tentang keuangan bisnis Anda hari ini..."
              disabled={loading}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "var(--text-primary)", fontSize: "15px", fontFamily: "inherit", padding: "12px 0",
              }}
            />
            <button
              id="chat-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: "44px", height: "44px", borderRadius: "14px", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                background: input.trim() && !loading ? "var(--accent)" : "var(--bg-card)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", flexShrink: 0,
                boxShadow: input.trim() && !loading ? "0 4px 12px var(--accent-glow)" : "none",
                border: input.trim() && !loading ? "none" : "1px solid var(--border)"
              }}
            >
              <Send size={18} color={input.trim() && !loading ? "white" : "var(--text-muted)"} style={{ transform: input.trim() && !loading ? "translateX(2px) translateY(-2px)" : "none", transition: "transform 0.2s" }} />
            </button>
          </div>
          
          <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", marginTop: "16px", fontWeight: 500 }}>
            Didukung Grok AI • Informasi bisa saja keliru, selalu periksa ulang data keuangan Anda.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-glow { 0%, 100% { opacity: 1; box-shadow: 0 0 0 0 var(--color-income-border); } 50% { opacity: 0.7; box-shadow: 0 0 0 6px transparent; } }
        
        /* Hide scrollbar for Quick Prompts but keep functionality */
        .hidden-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hidden-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
