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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid hsl(220 20% 14%)", background: "hsl(220 20% 8%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, hsl(270 91% 65%), hsl(217 91% 60%))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px hsl(270 91% 65% / 0.3)" }}>
            <Bot size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em" }}>Kas Kawan AI</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "hsl(142 71% 55%)", animation: "pulse-glow 2s infinite" }} />
              <span style={{ fontSize: 12, color: "hsl(142 71% 60%)", fontWeight: 500 }}>Online • Siap membantu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              animation: "fadeInUp 0.3s ease forwards",
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: msg.role === "user" ? "linear-gradient(135deg, hsl(142 71% 45%), hsl(161 94% 30%))" : "linear-gradient(135deg, hsl(270 91% 65%), hsl(217 91% 60%))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 2px 10px ${msg.role === "user" ? "hsl(142 71% 45% / 0.3)" : "hsl(270 91% 65% / 0.3)"}`,
            }}>
              {msg.role === "user" ? <User size={17} color="white" /> : <Bot size={17} color="white" />}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: "70%",
              padding: "12px 16px",
              borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
              background: msg.role === "user" ? "linear-gradient(135deg, hsl(142 71% 45%), hsl(161 94% 30%))" : "hsl(220 20% 12%)",
              border: msg.role === "user" ? "none" : "1px solid hsl(220 20% 20%)",
              fontSize: 14,
              lineHeight: 1.6,
              color: msg.role === "user" ? "white" : "hsl(210 40% 92%)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {msg.content}
              <p style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>
                {msg.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, hsl(270 91% 65%), hsl(217 91% 60%))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={17} color="white" />
            </div>
            <div style={{ padding: "14px 18px", borderRadius: "4px 14px 14px 14px", background: "hsl(220 20% 12%)", border: "1px solid hsl(220 20% 20%)", display: "flex", alignItems: "center", gap: 8 }}>
              <Loader2 size={16} color="hsl(270 91% 65%)" style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 13, color: "hsl(215 20% 55%)" }}>Kas Kawan sedang berpikir...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div style={{ padding: "8px 28px 0", display: "flex", gap: 8, overflowX: "auto", flexWrap: "nowrap" }}>
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              style={{
                padding: "7px 14px", borderRadius: 20, border: "1px solid hsl(220 20% 22%)",
                background: "hsl(220 20% 11%)", color: "hsl(215 20% 65%)", fontSize: 12,
                cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "hsl(270 91% 65% / 0.5)"; e.currentTarget.style.color = "hsl(270 91% 75%)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsl(220 20% 22%)"; e.currentTarget.style.color = "hsl(215 20% 65%)"; }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "16px 28px 24px", borderTop: "1px solid hsl(220 20% 14%)", background: "hsl(220 20% 8%)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: "hsl(220 20% 12%)", border: "1px solid hsl(220 20% 20%)", borderRadius: 14, padding: "4px 6px 4px 16px" }}>
          <Sparkles size={16} color="hsl(270 91% 65%)" style={{ flexShrink: 0 }} />
          <input
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Tanya tentang keuangan bisnis Anda..."
            disabled={loading}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "hsl(210 40% 96%)", fontSize: 14, fontFamily: "inherit", padding: "8px 0",
            }}
          />
          <button
            id="chat-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 38, height: 38, borderRadius: 10, border: "none", cursor: "pointer",
              background: input.trim() && !loading ? "linear-gradient(135deg, hsl(270 91% 65%), hsl(217 91% 60%))" : "hsl(220 20% 18%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", flexShrink: 0,
              boxShadow: input.trim() && !loading ? "0 2px 12px hsl(270 91% 65% / 0.3)" : "none",
            }}
          >
            <Send size={16} color={input.trim() && !loading ? "white" : "hsl(215 20% 45%)"} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: "hsl(215 20% 40%)", textAlign: "center", marginTop: 10 }}>
          Didukung Grok AI • Data keuangan Anda dilindungi & aman
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-glow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
