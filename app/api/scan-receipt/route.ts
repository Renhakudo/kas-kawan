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

  const formData = await request.formData();
  const imageFile = formData.get("image") as File | null;

  if (!imageFile) {
    return NextResponse.json({ error: "Tidak ada gambar yang dikirim" }, { status: 400 });
  }

  // Upload image to Supabase Storage
  const fileName = `receipts/${user.id}/${Date.now()}-${imageFile.name}`;
  const arrayBuffer = await imageFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(fileName, buffer, {
      contentType: imageFile.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    // Continue without storage if bucket doesn't exist yet
  }

  // Get public URL
  let receiptUrl = null;
  if (uploadData) {
    const { data: urlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(fileName);
    receiptUrl = urlData.publicUrl;
  }

  // Convert image to base64 for Gemini
  const base64 = buffer.toString("base64");
  const mimeType = imageFile.type || "image/jpeg";

  // Call Gemini API
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const geminiPrompt = `You are a highly accurate receipt parsing assistant for an Indonesian SME finance app. Extract the transaction details from the provided image.
CRITICAL INSTRUCTION: Even if the image is blurry, low lighting, or hard to read, try your absolute best to make an educated guess based on visible context (e.g. store name, visible numbers). Do not apologize or say you cannot read it.
If a specific field is completely unreadable, use reasonable defaults (amount: 0, description: "Tidak terbaca jelas").
Return ONLY a valid JSON object matching exactly this schema:
{
  "type": "expense",
  "amount": number (exact total amount in IDR/Rupiah, as integer. Example: 50000),
  "category": string (Best guess. Choose from: "Makanan & Minuman", "Transport", "Bahan Baku", "Peralatan", "Listrik & Air", "Gaji Karyawan", "Sewa", "Marketing", "Lainnya"),
  "description": string (Brief summary of what was bought/paid based on items, in Indonesian),
  "date": "YYYY-MM-DD" (If missing or unreadable, leave empty string or guess based on context)
}`;

  const geminiRes = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: geminiPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4, // Sedikit dinaikkan agar AI bisa "menebak" huruf yang buram
        maxOutputTokens: 512,
        response_mime_type: "application/json", // Memaksa AI HANYA merespons dalam format JSON
      },
    }),
  });

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    console.error("Gemini error:", errText);
    return NextResponse.json(
      { error: "Gagal memproses gambar dengan AI", receiptUrl },
      { status: 500 }
    );
  }

  const geminiData = await geminiRes.json();
  const rawText =
    geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Parse JSON from response
  try {
    const cleaned = rawText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ parsed, receiptUrl });
  } catch {
    return NextResponse.json(
      { error: "AI tidak dapat membaca struk ini. Coba input manual.", rawText, receiptUrl },
      { status: 422 }
    );
  }
}
