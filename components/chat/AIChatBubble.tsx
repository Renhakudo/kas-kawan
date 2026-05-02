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
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          background: "linear-gradient(135deg, hsl(270 91% 65%), hsl(217 91% 60%))",
          color: "white",
          border: "none",
          boxShadow: "0 4px 16px hsl(270 91% 65% / 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 9999,
          transition: "transform 0.2s",
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
          background: "hsl(220 20% 8%)",
          borderRadius: 20,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px hsl(220 20% 14%)",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 9999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px", borderBottom: "1px solid hsl(220 20% 14%)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, hsl(270 91% 65%), hsl(217 91% 60%))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={20} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Kas Kawan AI</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "hsl(142 71% 55%)" }} />
                <span style={{ fontSize: 11, color: "hsl(142 71% 60%)" }}>Online</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "hsl(215 20% 65%)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: msg.role === "user" ? "linear-gradient(135deg, hsl(142 71% 45%), hsl(161 94% 30%))" : "linear-gradient(135deg, hsl(270 91% 65%), hsl(217 91% 60%))",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {msg.role === "user" ? <User size={14} color="white" /> : <Bot size={14} color="white" />}
              </div>

              <div style={{
                maxWidth: "75%",
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                background: msg.role === "user" ? "linear-gradient(135deg, hsl(142 71% 45%), hsl(161 94% 30%))" : "hsl(220 20% 12%)",
                border: msg.role === "user" ? "none" : "1px solid hsl(220 20% 20%)",
                fontSize: 13,
                lineHeight: 1.5,
                color: msg.role === "user" ? "white" : "hsl(210 40% 92%)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, hsl(270 91% 65%), hsl(217 91% 60%))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={14} color="white" />
              </div>
              <div style={{ padding: "10px 14px", borderRadius: "4px 12px 12px 12px", background: "hsl(220 20% 12%)", border: "1px solid hsl(220 20% 20%)", display: "flex", alignItems: "center", gap: 8 }}>
                <Loader2 size={14} color="hsl(270 91% 65%)" style={{ animation: "spin 1s linear infinite" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div style={{ padding: "8px 16px 0", display: "flex", gap: 6, overflowX: "auto", flexWrap: "nowrap" }}>
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                style={{
                  padding: "6px 12px", borderRadius: 16, border: "1px solid hsl(220 20% 22%)",
                  background: "hsl(220 20% 11%)", color: "hsl(215 20% 65%)", fontSize: 11,
                  cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "12px 16px 16px" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: "hsl(220 20% 12%)", border: "1px solid hsl(220 20% 20%)", borderRadius: 12, padding: "4px 6px 4px 12px" }}>
            <Sparkles size={14} color="hsl(270 91% 65%)" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Tanya Kas Kawan..."
              disabled={loading}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "hsl(210 40% 96%)", fontSize: 13, fontFamily: "inherit", padding: "8px 0",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
                background: input.trim() && !loading ? "linear-gradient(135deg, hsl(270 91% 65%), hsl(217 91% 60%))" : "hsl(220 20% 18%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Send size={14} color={input.trim() && !loading ? "white" : "hsl(215 20% 45%)"} />
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
