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
    return NextResponse.json({ error: "Teks tidak valid" }, { status: 400 });
  }

  // Gunakan Gemini 2.5 Flash
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const prompt = `
Ekstrak transaksi keuangan dari kalimat berikut.
PENTING: Output HARUS berupa JSON valid tanpa format tambahan apa pun.

Kalimat: "${transcript}"

Aturan:
1. "type": "income" (jika berkaitan dengan uang masuk: jual, terima, masuk, dapat, gajian, untung) ATAU "expense" (jika berkaitan dengan uang keluar: beli, bayar, kasih, transfer, keluar).
2. "amount": nominal dalam integer. Kata "ribu" -> tambahkan 000, "juta" -> tambahkan 000000. Contoh: "15 ribu" -> 15000.
3. "category": Kategori singkat (misal: "Makanan", "Transportasi", "Gaji", "Belanja", "Lainnya").
4. "description": Deskripsi singkat untuk transaksi tersebut (tanpa nominal).
5. "date": Wajib gunakan string "${new Date().toISOString().split("T")[0]}".

Format JSON yang diharapkan:
{
  "type": "expense",
  "amount": 15000,
  "category": "Makanan",
  "description": "Beli nasi",
  "date": "${new Date().toISOString().split("T")[0]}"
}
`;

  try {
    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Gemini API Error:", errorText);
      throw new Error("Gagal memanggil AI");
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    const parsed = JSON.parse(rawText);

    if (!parsed.type || !parsed.amount || !parsed.category || !parsed.description || !parsed.date) {
      throw new Error("Field JSON tidak lengkap dari AI");
    }

    return NextResponse.json({ parsed });

  } catch (err) {
    console.error("VOICE PARSE ERROR:", err);
    return NextResponse.json(
      { error: "AI tidak dapat memproses kalimat ini. Coba lagi atau input manual." },
      { status: 422 }
    );
  }
}
