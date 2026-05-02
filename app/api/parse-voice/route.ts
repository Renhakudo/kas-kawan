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
    return NextResponse.json({ error: "Gemini API key tidak dikonfigurasi" }, { status: 500 });
  }

  const { transcript } = await request.json();
  if (!transcript) {
    return NextResponse.json({ error: "Tidak ada teks suara yang diterima" }, { status: 400 });
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const prompt = `Kamu adalah asisten pencatatan keuangan UMKM. Pengguna mengucapkan: "${transcript}"

Ekstrak informasi transaksi dari kalimat tersebut dan kembalikan HANYA JSON yang valid dengan format berikut:
{
  "type": "income" atau "expense",
  "amount": angka (jumlah dalam Rupiah, tanpa titik/koma),
  "category": string (misal: "Makanan & Minuman", "Transport", "Penjualan", "Bahan Baku", "Jasa", "Lainnya"),
  "description": string (ringkasan singkat dalam bahasa Indonesia),
  "date": "YYYY-MM-DD" (hari ini: ${new Date().toISOString().split("T")[0]})
}

Aturan:
- Jika tidak ada kata "jual/terima/masuk/dapat", anggap "expense"
- Jika ada "jual/terima/masuk/dapat/bayar ke kita", anggap "income"
- Jangan sertakan markdown, backtick, atau teks lain. Hanya JSON murni.`;

  const res = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Gagal memproses suara dengan AI" }, { status: 500 });
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  try {
    const cleaned = rawText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ parsed });
  } catch {
    return NextResponse.json(
      { error: "AI tidak dapat memproses kalimat ini. Coba input manual.", rawText },
      { status: 422 }
    );
  }
}
