const apiKey = process.env.GEMINI_API_KEY;

async function test() {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Ini adalah tes. Jawab dengan {"type": "income", "amount": 100}`;

  const res = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.1, 
        maxOutputTokens: 256,
        response_mime_type: "application/json",
        response_schema: {
          type: "OBJECT",
          properties: {
            type: { type: "STRING", enum: ["income", "expense"] },
            amount: { type: "NUMBER" },
            category: { type: "STRING" },
            description: { type: "STRING" },
            date: { type: "STRING" }
          },
          required: ["type", "amount", "category", "description", "date"]
        }
      },
    }),
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

test();
