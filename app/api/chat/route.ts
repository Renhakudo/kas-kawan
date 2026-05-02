import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, history } = await request.json();

  // Fetch user's transaction summary for context
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data: txData } = await supabase
    .from("transactions")
    .select("type, amount, category, transaction_date")
    .eq("user_id", user.id)
    .gte("transaction_date", monthStart.toISOString())
    .order("transaction_date", { ascending: false });

  const transactions = txData || [];
  const weekTx = transactions.filter((t) => new Date(t.transaction_date) >= weekAgo);

  const monthIncome = transactions.filter((t) => t.type === "income").reduce((s: number, t: { amount: number }) => s + t.amount, 0);
  const monthExpense = transactions.filter((t) => t.type === "expense").reduce((s: number, t: { amount: number }) => s + t.amount, 0);
  const weekExpense = weekTx.filter((t) => t.type === "expense").reduce((s: number, t: { amount: number }) => s + t.amount, 0);
  const weekIncome = weekTx.filter((t) => t.type === "income").reduce((s: number, t: { amount: number }) => s + t.amount, 0);

  const fmtRp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const contextSummary = `
Data keuangan pengguna (bulan ini, ${now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}):
- Total Pemasukan: ${fmtRp(monthIncome)}
- Total Pengeluaran: ${fmtRp(monthExpense)}
- Saldo Bersih: ${fmtRp(monthIncome - monthExpense)}
- Pengeluaran minggu ini: ${fmtRp(weekExpense)}
- Pemasukan minggu ini: ${fmtRp(weekIncome)}
- Jumlah transaksi bulan ini: ${transactions.length}
`.trim();

  const GROK_API_KEY = process.env.GROK_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  // Use Grok if available, fallback to Gemini
  if (GROK_API_KEY) {
    const systemPrompt = `Kamu adalah Kas Kawan, asisten keuangan yang ramah dan profesional untuk pelaku UMKM di Indonesia. 
Berikan saran keuangan yang ringkas, actionable, dan menggembirakan berdasarkan data transaksi pengguna.
Hindari istilah akuntansi yang kompleks. Gunakan bahasa Indonesia yang natural dan hangat.
Gunakan angka Rupiah dalam format yang mudah dibaca (contoh: Rp 150.000).

${contextSummary}`;

    const messages = [
      ...(history || []),
      { role: "user", content: message },
    ];

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROK_API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: false,
        max_tokens: 512,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Maaf, saya tidak dapat merespons saat ini.";
      return NextResponse.json({ reply });
    } else {
      const err = await res.text();
      console.error("Groq API Error:", res.status, err);
    }
  }

  // Fallback: Gemini
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "API key tidak dikonfigurasi" }, { status: 500 });
  }

  const systemPrompt = `Kamu adalah Kas Kawan, asisten keuangan yang ramah dan profesional untuk pelaku UMKM di Indonesia. 
Berikan saran keuangan yang ringkas, actionable, dan menggembirakan berdasarkan data transaksi pengguna.
Hindari istilah akuntansi yang kompleks. Gunakan bahasa Indonesia yang natural dan hangat.

${contextSummary}

Pengguna bertanya: ${message}`;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
      }),
    }
  );

  if (!geminiRes.ok) {
    const err = await geminiRes.text();
    console.error("Gemini API Error:", geminiRes.status, err);
    return NextResponse.json({ error: "Asisten tidak dapat merespons saat ini" }, { status: 500 });
  }

  const geminiData = await geminiRes.json();
  const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak dapat merespons saat ini.";
  return NextResponse.json({ reply });
}
