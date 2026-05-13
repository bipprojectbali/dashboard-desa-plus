# Plan: Fungsionalkan Chatbot Jenna (Virtual Assistant)

## Context

Halaman `/bantuan` punya widget chatbot **"Jenna - Virtual Assistant"** (`src/components/help-page.tsx` baris 442–535). Saat ini Jenna adalah stub — setiap pesan apapun dibalas dengan teks hardcoded yang sama setelah delay 1 detik simulasi:

```ts
// SAAT INI: stub
setTimeout(() => {
  setMessages((prev) => [...prev, {
    text: "Terima kasih atas pertanyaan Anda. Saat ini saya adalah versi awal...",
    sender: "jenna",
  }]);
}, 1000);
```

Tidak ada AI, tidak ada backend endpoint, tidak ada API key. Tujuan: buat Jenna menjawab pertanyaan secara nyata via **Google Gemini API**.

---

## Arsitektur Target

```
User ketik pesan
  → frontend POST /api/jenna/chat { message, history }
  → Elysia handler (src/api/jenna.ts) + apiMiddleware (auth)
  → Google Generative AI SDK → Gemini 1.5 Flash (model cepat & murah)
  → return { reply: "..." }
  → tampil di bubble chat Jenna
```

---

## Step-by-Step Plan

### 1. Install Google Generative AI SDK

```bash
bun add @google/generative-ai
```

### 2. Tambah API Key ke `.env`

```env
GEMINI_API_KEY=AIza...
```

> Cara dapat key gratis: buka https://aistudio.google.com → "Get API Key" → free tier 15 req/menit, 1.500 req/hari.

### 3. Buat API Handler — `src/api/jenna.ts` _(file baru)_

Pola: ikuti persis `src/api/notification-preferences.ts` (Elysia plugin + apiMiddleware).

```ts
import Elysia, { t } from "elysia";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { apiMiddleware } from "../middleware/apiMiddleware";
import logger from "../utils/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const SYSTEM_PROMPT = `Kamu adalah Jenna, asisten virtual Dashboard Desa Darmasaba.
Kamu membantu pengguna memahami fitur-fitur dashboard desa: kinerja divisi,
layanan publik, demografi, keuangan, pengaturan, dan sinkronisasi data.
Jawab dalam Bahasa Indonesia, singkat dan ramah. Jika tidak tahu, arahkan ke tim support.`;

export const jennaChat = new Elysia({ prefix: "/jenna" })
  .use(apiMiddleware)
  .post(
    "/chat",
    async ({ body, set }) => {
      try {
        const { message, history } = body;

        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: SYSTEM_PROMPT,
        });

        // Bangun history percakapan untuk konteks
        const chat = model.startChat({
          history: history.map((h) => ({
            role: h.sender === "user" ? "user" : "model",
            parts: [{ text: h.text }],
          })),
        });

        const result = await chat.sendMessage(message);
        const reply = result.response.text();

        return { reply };
      } catch (error) {
        logger.error({ error }, "Jenna chat error");
        set.status = 500;
        return { error: "Jenna sedang tidak tersedia. Coba lagi nanti." };
      }
    },
    {
      body: t.Object({
        message: t.String({ minLength: 1 }),
        history: t.Array(
          t.Object({
            id: t.Number(),
            text: t.String(),
            sender: t.String(),
          })
        ),
      }),
      response: {
        200: t.Object({ reply: t.String() }),
        500: t.Object({ error: t.String() }),
      },
      detail: { summary: "Chat dengan Jenna Virtual Assistant" },
    }
  );
```

### 4. Mount di `src/api/index.tsx`

Tambah import dan `.use(jennaChat)` — sama persis seperti handler lain.

### 5. Update Frontend — `src/components/help-page.tsx`

Ganti `handleSendMessage` dari stub `setTimeout` menjadi async fetch:

```ts
const handleSendMessage = async () => {
  if (inputValue.trim() === "" || isLoading) return;

  const currentInput = inputValue;
  const userMsg = { id: Date.now(), text: currentInput, sender: "user" };

  setMessages((prev) => [...prev, userMsg]);
  setInputValue("");
  setIsLoading(true);

  try {
    const res = await fetch("/api/jenna/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: currentInput,
        history: messages, // kirim history agar Jenna punya konteks
      }),
    });

    const json = await res.json();
    const reply = res.ok ? json.reply : json.error ?? "Terjadi kesalahan.";

    setMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, text: reply, sender: "jenna" },
    ]);
  } catch {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, text: "Koneksi gagal. Coba lagi.", sender: "jenna" },
    ]);
  } finally {
    setIsLoading(false);
  }
};
```

Juga: tampilkan loading indicator (bubble `...` atau teks `"Jenna sedang mengetik..."`) saat `isLoading === true`.

---

## Files yang Dimodifikasi

| File | Action |
|---|---|
| `.env` | Tambah `GEMINI_API_KEY` |
| `src/api/jenna.ts` | Buat baru — Elysia handler ke Gemini API |
| `src/api/index.tsx` | Mount `jennaChat` |
| `src/components/help-page.tsx` | Ganti stub `handleSendMessage` → async fetch |

> Tidak ada perubahan Prisma/DB — chat tidak perlu disimpan ke database.

---

## Model yang Dipakai

**`gemini-1.5-flash`** via Google AI Studio:
- Gratis: 15 req/menit, 1.500 req/hari, 1 juta token/menit
- Respons cepat (~1 detik)
- Support multi-turn conversation (history) secara native
- Cukup pintar untuk FAQ & bantuan navigasi dashboard

---

## Catatan Keamanan

- `apiMiddleware` memastikan user harus login → tidak ada anonymous abuse
- `GEMINI_API_KEY` hanya ada di server, tidak pernah exposed ke frontend/Vite
- History dikirim dari frontend — aman karena hanya teks chat sendiri

---

## Verification

1. `bun add @google/generative-ai` → install berhasil
2. Tambah `GEMINI_API_KEY` di `.env`
3. `bun run dev` → tidak ada error startup
4. Login → buka `/bantuan`
5. Ketik pertanyaan tentang dashboard → Jenna jawab dengan jawaban nyata
6. Kirim beberapa pesan → Jenna "ingat" konteks percakapan sebelumnya
7. Tanpa login → `POST /api/jenna/chat` langsung → dapat `401`
8. `bun run check` → tidak ada error Biome