# 06 — Fitur 3: interaksi suara

> **Pembaruan 2026-10-02:** user ingin mode suara ala ChatGPT **full duplex** dengan transkrip langsung dan pointer sesuai perintah, memakai **OpenAI** (bukan Claude). Analisa baru dibuat worker `ai_suara` di `discus/fitur-3-suara.md`; draf di bawah adalah analisa lama.

> **Status: DRAF — dibahas setelah fitur 2.** User baru pertama kali menyentuh konteks mode suara;
> dokumen ini menjelaskan pilihan dulu, keputusan diambil saat sesi pembahasan.

## 1. Istilah
- **Mode suara ChatGPT (Voice / Advanced Voice)** dan **Project Astra (Google DeepMind)**: keduanya
  percakapan suara-ke-suara real-time yang bisa dipotong di tengah jalan. Astra juga "melihat" lewat kamera.
- Untuk dashboard, yang relevan adalah **bicara → asisten menjawab (dan menunjuk layar via fitur 2)**.

Prinsip: suara adalah **lapisan input/output** di atas pipeline teks fitur 1 — tool, izin, batas, dan
aksi UI tetap sama. Tidak membangun otak kedua.

## 2. Tiga tingkat implementasi

| Tingkat | Cara | Kelebihan | Kekurangan | API key |
|---|---|---|---|---|
| 1. Browser (Web Speech API) | `SpeechRecognition` (suara→teks, `lang='id-ID'`) + `speechSynthesis` (teks→suara), tombol tekan-untuk-bicara di `AssistantComposer` | Tanpa biaya & dependency, cepat dibuat | Dukungan browser tidak merata (umumnya baik di Chrome/Edge; Firefox tidak punya pengenalan suara; Safari terbatas) — **perlu diuji di perangkat target**; di Chrome audio diproses layanan Google | Tidak perlu |
| 2. Pipeline server STT → LLM → TTS | Rekam audio di browser, kirim ke server, transkripsi, pipeline teks, hasil diubah ke audio | Konsisten lintas browser, kualitas terkontrol | Biaya per menit, latensi beberapa detik | Butuh provider STT/TTS — **proxy Claude tidak menyediakannya** → slot `voice` diisi provider lain |
| 3. Real-time suara-ke-suara | Sesi audio dua arah (WebRTC/WebSocket) ke API realtime | Paling natural, bisa dipotong | Paling mahal & kompleks; tool-calling disambung ulang; dashboard belum punya WebSocket | Butuh provider realtime |

**Rekomendasi awal:** tingkat 1 dulu, dengan fallback ke ketik bila browser tak mendukung. Naik ke 2/3
hanya bila tingkat 1 terbukti dipakai dan kurang memadai.

## 3. Kaitan dengan pondasi
- Slot `voice` di `AiProviderConfig` sudah ada (`providerType` disiapkan untuk tipe selain
  OpenAI-compatible chat). Di tingkat 1 slot ini tidak dipakai.
- Batas pemakaian yang sama berlaku; transkrip dihitung sebagai pesan biasa.
- Mikrofon butuh HTTPS (staging sudah HTTPS) dan izin browser.

## 4. Pertanyaan untuk sesi pembahasan fitur 3
1. Perangkat & browser apa yang dipakai pengguna dashboard (laptop kantor desa? Chrome?).
2. Jawaban dibacakan otomatis, atau hanya saat mode suara aktif?
3. Target akhir "ucapkan → kursor bergerak sambil asisten menjelaskan" (gabungan fitur 1+2+3) — perlu
   di versi pertama atau belakangan?
4. Privasi: audio tidak disimpan. Bila tingkat 2/3, audio dikirim ke pihak ketiga → perlu pemberitahuan ke pengguna.
