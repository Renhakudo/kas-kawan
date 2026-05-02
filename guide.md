
# PROJECT OVERVIEW: Kas Kawan - Autonomous SME Financial Assistant

## 1. Project Description
"Kas Kawan" is a modern, web-based Autonomous SME Financial Assistant designed to eliminate the operational drag of manual financial recording for micro, small, and medium enterprises (SMEs). It uses Agentic Multimodal AI to automate transaction logging via receipt scanning, voice input, and manual entry. 

## 2. Tech Stack & Infrastructure
- **Frontend Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + shadcn/ui (for fast, accessible, and modern UI components)
- **Database, Auth & Storage:** Supabase (PostgreSQL)
- **AI Integration 1 (Multimodal/OCR):** Google Gemini API (Gemini 1.5 Flash/Pro) for processing receipt images and extracting structured JSON data.
- **AI Integration 2 (Chatbot):** Grok API for an interactive, intelligent financial assistant chatbot to help SMEs analyze their data and ask business questions.
- **Voice Recognition:** Web Speech API (Native browser API) for voice-to-text transaction input.
- **Icons:** Lucide React

## 3. Database Schema (Supabase PostgreSQL)
Create the following tables in Supabase:

```sql
-- Table: transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(10) CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  receipt_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: categories (Optional but recommended for consistency)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense'))
);
```

## 4. Core Features to Implement

### A. Dashboard (Financial Overview)
- Fetch and display total income, total expense, and current balance based on the current month.
- Render a Cash Flow Chart (use Recharts or Chart.js) showing daily/weekly income vs. expenses.
- Display a "Recent Transactions" list.

### B. Input Modalities (The "Antigravity" Flow)
1. **Scan Receipt (Gemini API):**
   - UI: Drag-and-drop or camera capture interface to upload a receipt.
   - Flow: Upload image to Supabase Storage -> Get public URL -> Send image to Gemini API with a strict system prompt to return a JSON object (amount, category, description, date).
   - Show a confirmation UI for the user to review the extracted data before saving to Supabase.
2. **Voice Input (Web Speech API + Gemini):**
   - UI: A prominent microphone button.
   - Flow: Record voice -> Convert to text via Web Speech API -> Send raw text to Gemini API to parse into structured JSON (amount, type, category, description).
3. **Manual Input:**
   - Standard form with validation (Zod + React Hook Form).

### C. Grok AI Financial Chatbot
- A floating chat interface or dedicated `/assistant` page.
- Context-Aware: The chatbot should be fed the user's recent transaction summaries (e.g., "Total expense this week is Rp 500.000") so it can answer specific questions like "Are my expenses too high this week?" using the Grok API.

## 5. Implementation Rules & Best Practices

- **Component Architecture:** Use modular, reusable components. Keep client components (`"use client"`) at the leaves of the render tree and use Server Components for data fetching wherever possible.
- **Supabase Client:** Create a singleton Supabase client utility (`@supabase/ssr` or `@supabase/supabase-js`) for both server and client operations.
- **Environment Variables:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `GEMINI_API_KEY`
  - `GROK_API_KEY`
- **Error Handling:** Implement robust error states. If Gemini fails to parse a receipt, gracefully fallback to manual input mode with the image attached. If voice recognition fails, prompt the user to try again or type.
- **UI/UX:** The target audience is SME owners. The UI must be highly intuitive, minimal, and mobile-responsive. Use large buttons and clear typography.

## 6. One-Shot Prompts for AI Endpoints

**Gemini API Prompt (For Receipt Parsing):**
`"You are a highly accurate receipt parsing assistant. Extract the transaction details from the provided image. Return ONLY a valid JSON object with the following schema: { 'type': 'expense', 'amount': number (exact total), 'category': string (e.g., Food, Transport, Supplies), 'description': string (brief summary), 'date': 'YYYY-MM-DD' }. Do not include markdown formatting or extra text."`

**Grok API Prompt (For Chatbot System Prompt):**
`"You are Kas Kawan, a friendly and professional financial assistant for SMEs in Surabaya. Provide concise, actionable, and encouraging financial advice based on the user's transaction data. Avoid complex accounting jargon."`

## 7. Execution Steps for the AI Coder
1. Initialize the Next.js project with Tailwind CSS and install required dependencies (Supabase, Shadcn, Lucide).
2. Set up the Supabase database connection and user authentication flow.
3. Build the Application Shell (Sidebar/Navbar) and the main Dashboard layout.
4. Implement the Transaction API routes (CRUD operations).
5. Develop the Multimodal Input features (Voice API integration, Image upload, and Gemini API route).
6. Develop the Chatbot interface and integrate the Grok API route.
7. Polish UI/UX, ensuring mobile responsiveness and loading states.
```

***

### 💡 Tips Tambahan untuk *Hackathon*
* **Fokus di MVP (Minimum Viable Product):** Saat menggunakan *AI Coder*, minta AI untuk menyelesaikan fitur *Scan Receipt* dan *Dashboard* terlebih dahulu. Dua fitur ini adalah "bintang utama" yang paling memukau juri saat demo.
* **Dummy Data:** Siapkan *dummy data* transaksi yang realistis di database untuk mendemonstrasikan kemampuan *chatbot* Grok dan grafik di *dashboard*.

