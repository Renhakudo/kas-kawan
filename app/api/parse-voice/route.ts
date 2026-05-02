import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key tidak dikonfigurasi" },
      { status: 500 }
    );
  }

  const { transcript } = await request.json();

  if (!transcript || transcript.trim().length < 3) {
    return NextResponse.json(
      { error: "Teks tidak valid" },
      { status: 400 }
    );
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const prompt = `
Ekstrak transaksi keuangan dari kalimat berikut menjadi JSON VALID.

"${transcript}"

Rules:
- income jika ada kata: jual, terima, masuk, dapat
- selain itu = expense
- amount = angka bulat (tanpa titik/koma)
- category bebas (contoh: Makanan, Transport, dll)
- date format YYYY-MM-DD (hari ini: ${new Date().toISOString().split("T")[0]})

Output WAJIB:
- hanya JSON
- tanpa markdown
- tanpa penjelasan

Contoh:
{
  "type": "expense",
  "amount": 5000,
  "category": "Makanan",
  "description": "Beli kopi",
  "date": "${new Date().toISOString().split("T")[0]}"
}
`;

  async function callGemini() {
    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024, // ⬅️ penting: biar ga kepotong
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  let rawText = "";

  // 🔁 retry 2x kalau kepotong
  for (let i = 0; i < 2; i++) {
    rawText = await callGemini();

    console.log("RAW GEMINI:", rawText);

    if (rawText.includes("}")) break;
  }

  try {
    // ambil JSON saja (buang teks sampah)
    const match = rawText.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("JSON tidak ditemukan");
    }

    let parsed = JSON.parse(match[0]);

    // normalize amount (kalau string)
    if (typeof parsed.amount === "string") {
      parsed.amount = parseInt(parsed.amount.replace(/\D/g, ""), 10);
    }

    // validasi final
    if (
      !parsed.type ||
      !parsed.amount ||
      !parsed.category ||
      !parsed.description ||
      !parsed.date
    ) {
      throw new Error("Field tidak lengkap");
    }

    return NextResponse.json({ parsed });

  } catch (err) {
    console.error("PARSE ERROR:", rawText);

    return NextResponse.json(
      {
        error: "AI tidak dapat memproses kalimat ini",
        rawText,
      },
      { status: 422 }
    );
  }
}
