"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, MessageCircle, X } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

const QUICK_PROMPTS = [
  "Bagaimana kondisi keuangan bulan ini?",
  "Pengeluaran terbesar saya?",
];

export function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Halo! Saya Kas Kawan, asisten keuangan AI Anda 👋\nApa yang ingin Anda tanyakan?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

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

      const reply = data.reply || "Maaf, saya tidak dapat merespons saat ini.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Terjadi kesalahan koneksi.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      {/* Floating Button (Solid Brand Color) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          background: "var(--accent)", // 1 Warna Solid
          color: "white",
          border: "none",
          boxShadow: "0 8px 24px var(--accent-glow)", // Glow menyesuaikan warna accent
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 9999,
          transition: "transform 0.2s, box-shadow 0.2s",
          transform: isOpen ? "scale(0)" : "scale(1)",
        }}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      <div
        style={{
          position: "fixed",
          bottom: isOpen ? 24 : -600,
          right: 24,
          width: 380,
          height: 600,
          maxHeight: "calc(100vh - 100px)",
          maxWidth: "calc(100vw - 48px)",
          background: "var(--bg-page)", // Mengikuti background tema
          borderRadius: 24, // Lebih melengkung ala modern UI
          boxShadow: "0 24px 48px rgba(0,0,0,0.2), 0 0 0 1px var(--border)",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 9999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          overflow: "hidden", // Memastikan rounded corners terjaga
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent-muted)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={20} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>KasKawan AI</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "pulse-glow 2s infinite" }} />
                <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>Siap membantu</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            style={{ 
              width: 32, height: 32, borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" 
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                animation: "fadeInUp 0.3s ease forwards",
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: msg.role === "user" ? "var(--accent)" : "var(--bg-card)",
                border: msg.role === "user" ? "none" : "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: msg.role === "user" ? "0 4px 12px var(--accent-glow)" : "var(--shadow-card)",
              }}>
                {msg.role === "user" ? <User size={16} color="white" /> : <Bot size={16} color="var(--accent)" />}
              </div>

              {/* Chat Bubble */}
              <div style={{
                maxWidth: "75%",
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                background: msg.role === "user" ? "var(--accent)" : "var(--bg-elevated)",
                border: msg.role === "user" ? "none" : "1px solid var(--border)",
                fontSize: 14,
                lineHeight: 1.6,
                color: msg.role === "user" ? "white" : "var(--text-primary)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                boxShadow: msg.role === "user" ? "0 4px 16px var(--accent-glow)" : "none",
              }}>
                {msg.content}
                <p style={{ 
                  fontSize: 11, 
                  opacity: 0.7, 
                  marginTop: 8, 
                  textAlign: msg.role === "user" ? "right" : "left",
                  fontWeight: 500 
                }}>
                  {msg.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", animation: "fadeIn 0.3s ease forwards" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-card)" }}>
                <Bot size={16} color="var(--accent)" />
              </div>
              <div style={{ padding: "12px 16px", borderRadius: "4px 16px 16px 16px", background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                <Loader2 size={16} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Sedang mengetik...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="hidden-scrollbar" style={{ padding: "8px 20px 0", display: "flex", gap: 8, overflowX: "auto", flexWrap: "nowrap" }}>
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                style={{
                  padding: "8px 14px", borderRadius: 100, border: "1px solid var(--border)",
                  background: "var(--bg-card)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-muted)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "var(--bg-card)"; }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div style={{ padding: "16px 20px", background: "var(--bg-page)", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 16, padding: "6px 6px 6px 16px", transition: "border-color 0.2s" }}>
            <Sparkles size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Tanya asisten AI..."
              disabled={loading}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", padding: "10px 0",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36, borderRadius: 12, cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                background: input.trim() && !loading ? "var(--accent)" : "var(--bg-card)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.2s ease",
                border: input.trim() && !loading ? "none" : "1px solid var(--border)",
                boxShadow: input.trim() && !loading ? "0 4px 12px var(--accent-glow)" : "none",
              }}
            >
              <Send size={16} color={input.trim() && !loading ? "white" : "var(--text-muted)"} style={{ transform: input.trim() && !loading ? "translateX(1px) translateY(-1px)" : "none", transition: "transform 0.2s" }} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-glow { 0%, 100% { opacity: 1; box-shadow: 0 0 0 0 var(--color-income-border); } 50% { opacity: 0.7; box-shadow: 0 0 0 4px transparent; } }
        
        .hidden-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hidden-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
