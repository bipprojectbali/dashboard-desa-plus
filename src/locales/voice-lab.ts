/** Teks halaman uji suara S0 (id/en). Halaman sekali pakai untuk admin. */

export interface VoiceLabText {
	title: string;
	subtitle: string;
	backToSettings: string;
	linkLabel: string;
	linkHint: string;
	unsupportedBrowser: string;
	quotaNote: string;
	slotNotReady: string;
	loadFailed: string;
	pathV2: string;
	pathV2Hint: string;
	pathV1b: string;
	pathV1bHint: string;
	turnOn: string;
	turnOff: string;
	manualEnd: string;
	manualEndOnlyV2: string;
	statusOff: string;
	statusConnecting: string;
	statusReady: string;
	statusListening: string;
	statusAnswering: string;
	remaining: string;
	autoOffIdle: string;
	autoOffCap: string;
	settings: string;
	transcribeModel: string;
	transcribeMode: string;
	modeToken: string;
	modeRelay: string;
	language: string;
	delay: string;
	ttsModel: string;
	ttsVoice: string;
	liveModel: string;
	liveInstructions: string;
	endMethod: string;
	endVad: string;
	endManual: string;
	threshold: string;
	silence: string;
	echoCancellation: string;
	noiseSuppression: string;
	microphone: string;
	defaultMic: string;
	deviceTest: string;
	deviceTestIntro: string;
	testMic: string;
	stopTest: string;
	level: string;
	applied: string;
	webrtc: string;
	webrtcOk: string;
	webrtcFail: string;
	conversation: string;
	emptyConversation: string;
	you: string;
	claudeOriginal: string;
	gptLiveSpoken: string;
	pointerPresent: string;
	stateListening: string;
	stateTranscribing: string;
	stateThinking: string;
	stateAnswering: string;
	stateDone: string;
	stateInterrupted: string;
	stateError: string;
	metrics: string;
	metricTranscript: string;
	metricFirstToken: string;
	metricFirstAudio: string;
	metricAnswerAudio: string;
	fillerLabel: string;
	metricOverlap: string;
	metricEnd: string;
	turnCol: string;
	pathCol: string;
	count: string;
	noTurns: string;
	includeText: string;
	includeTextWarning: string;
	copyJson: string;
	downloadJson: string;
	copied: string;
	clearMetrics: string;
	logs: string;
	unknownEvents: string;
	sendMode: string;
	sendWhole: string;
	sendSentence: string;
	instructionsReset: string;
	instructionsTooLong: string;
	instructionsHint: string;
	metricFirstSentence: string;
	metricMatch: string;
	modeCol: string;
	numbersChangedCol: string;
	modeV2: string;
	modeV1bWhole: string;
	modeV1bSentence: string;
	verifyNumbers: string;
	verifyNoNumbers: string;
	verifyChanged: string;
	verifyMissing: string;
	verifyExtra: string;
	verifyTerms: string;
	verifyPending: string;
	verifySkipped: string;
	chunksSent: string;
}

const id: VoiceLabText = {
	title: "S0 — Halaman uji suara",
	subtitle:
		"Uji coba sekali pakai untuk mikrofon, transkripsi, dan suara jawaban Jenna. Audio tidak disimpan di server.",
	backToSettings: "Kembali ke pengaturan AI Assistant",
	linkLabel: "S0 — Halaman uji suara",
	linkHint: "Uji mikrofon, transkripsi, dan jawaban bersuara (sekali pakai).",
	unsupportedBrowser:
		"Halaman ini hanya diuji untuk Chrome/Edge desktop. Di browser lain hasilnya tidak bisa diandalkan.",
	quotaNote:
		"Setiap giliran jalur V2 dan V1-B memakai kuota chat sungguhan (sama seperti mengetik di panel asisten).",
	slotNotReady: "Slot Suara belum siap",
	loadFailed: "Gagal memuat konfigurasi halaman uji",
	pathV2: "V2 — telinga + mulut",
	pathV2Hint:
		"Mikrofon → transkripsi → Claude (chat) → teks → suara. Satu otak: Claude.",
	pathV1b: "V1-B — GPT-Live + delegasi",
	pathV1bHint:
		"GPT-Live bicara; pertanyaan didelegasikan ke Claude, hasilnya dibacakan ulang GPT-Live.",
	turnOn: "Nyalakan",
	turnOff: "Matikan",
	manualEnd: "Selesai bicara",
	manualEndOnlyV2: "Tombol ini hanya untuk jalur V2",
	statusOff: "Mati",
	statusConnecting: "Menghubungkan",
	statusReady: "Siap bicara",
	statusListening: "Mendengarkan",
	statusAnswering: "Menjawab",
	remaining: "Sisa waktu sesi",
	autoOffIdle: "Dimatikan otomatis: tidak ada aktivitas 2 menit.",
	autoOffCap: "Dimatikan otomatis: batas 10 menit per sesi tercapai.",
	settings: "Pengaturan uji",
	transcribeModel: "Model transkripsi",
	transcribeMode: "Cara sambung transkripsi",
	modeToken: "Token sementara (browser langsung)",
	modeRelay: "Relay lewat server",
	language: "Bahasa",
	delay: "Delay transkripsi",
	ttsModel: "Model suara (TTS)",
	ttsVoice: "Suara",
	liveModel: "Model GPT-Live",
	liveInstructions:
		"Instruksi GPT-Live (bacakan persis; kosongkan = tanpa instruksi)",
	endMethod: "Penanda akhir ucapan",
	endVad: "Otomatis (deteksi hening)",
	endManual: "Manual (tombol)",
	threshold: "Ambang suara",
	silence: "Hening untuk akhir ucapan (ms)",
	echoCancellation: "Peredam gema",
	noiseSuppression: "Peredam bising",
	microphone: "Mikrofon",
	defaultMic: "Bawaan sistem",
	deviceTest: "Tes perangkat",
	deviceTestIntro: "Cek mikrofon dan dukungan WebRTC sebelum menyalakan sesi.",
	testMic: "Tes mikrofon",
	stopTest: "Hentikan tes",
	level: "Level suara",
	applied: "Diterapkan browser",
	webrtc: "WebRTC",
	webrtcOk: "Didukung",
	webrtcFail: "Bermasalah",
	conversation: "Percakapan",
	emptyConversation: "Belum ada percakapan. Nyalakan lalu bicara.",
	you: "Anda",
	claudeOriginal: "Teks asli Claude",
	gptLiveSpoken: "Yang diucapkan GPT-Live",
	pointerPresent: "Ada aksi penunjuk",
	stateListening: "mendengarkan",
	stateTranscribing: "menyalin ucapan",
	stateThinking: "berpikir",
	stateAnswering: "menjawab",
	stateDone: "selesai",
	stateInterrupted: "dipotong",
	stateError: "gagal",
	metrics: "Pengukuran",
	metricTranscript: "Akhir ucapan → transkrip",
	metricFirstToken: "→ token Claude pertama",
	metricFirstAudio: "→ audio pertama",
	metricAnswerAudio: "→ suara jawaban",
	fillerLabel: "Pengisi (sebelum jawaban)",
	metricOverlap: "Kemiripan",
	metricEnd: "Akhir",
	turnCol: "Giliran",
	pathCol: "Jalur",
	count: "n",
	noTurns: "Belum ada pengukuran.",
	includeText: "Sertakan teks transkrip & jawaban",
	includeTextWarning:
		"Jangan menyebut data pribadi (nama, NIK, alamat, nomor HP) saat uji bila teks ikut diekspor.",
	copyJson: "Salin JSON",
	downloadJson: "Unduh JSON",
	copied: "Tersalin",
	clearMetrics: "Hapus pengukuran",
	logs: "Log tahap (tanpa isi percakapan)",
	unknownEvents: "Tipe event tak dikenal",
	sendMode: "Mode kirim jawaban (V1-B)",
	sendWhole: "Utuh sekaligus",
	sendSentence: "Per kalimat",
	instructionsReset: "Pakai instruksi bawaan",
	instructionsTooLong: "Instruksi melebihi batas karakter",
	instructionsHint:
		"Tidak ada mode baca-persis resmi di GPT-Live; instruksi ini upaya terbaik dan hasilnya diperiksa pencocokan otomatis.",
	metricFirstSentence: "→ potongan pertama dikirim",
	metricMatch: "Skor angka",
	modeCol: "Mode",
	numbersChangedCol: "Angka berubah",
	modeV2: "V2",
	modeV1bWhole: "V1-B utuh",
	modeV1bSentence: "V1-B per kalimat",
	verifyNumbers: "Angka cocok",
	verifyNoNumbers: "Jawaban tanpa angka",
	verifyChanged: "Angka berubah",
	verifyMissing: "Hilang/berubah",
	verifyExtra: "Tambahan di ucapan",
	verifyTerms: "Nama/satuan tidak disebut",
	verifyPending: "Menunggu GPT-Live selesai bicara…",
	verifySkipped: "Tidak dinilai (giliran terputus)",
	chunksSent: "potongan",
};

const en: VoiceLabText = {
	title: "S0 — Voice test page",
	subtitle:
		"One-off test for microphone, transcription and spoken answers from Jenna. Audio is never stored on the server.",
	backToSettings: "Back to AI Assistant settings",
	linkLabel: "S0 — Voice test page",
	linkHint: "Test microphone, transcription and spoken answers (one-off).",
	unsupportedBrowser:
		"This page is only tested on desktop Chrome/Edge. Results in other browsers are unreliable.",
	quotaNote:
		"Every V2 and V1-B turn uses your real chat quota (same as typing in the assistant panel).",
	slotNotReady: "Voice slot is not ready",
	loadFailed: "Failed to load the test page configuration",
	pathV2: "V2 — ears + mouth",
	pathV2Hint:
		"Mic → transcription → Claude (chat) → text → speech. One brain: Claude.",
	pathV1b: "V1-B — GPT-Live + delegation",
	pathV1bHint:
		"GPT-Live speaks; questions are delegated to Claude and GPT-Live reads the result back.",
	turnOn: "Turn on",
	turnOff: "Turn off",
	manualEnd: "Done speaking",
	manualEndOnlyV2: "This button only applies to the V2 path",
	statusOff: "Off",
	statusConnecting: "Connecting",
	statusReady: "Ready to talk",
	statusListening: "Listening",
	statusAnswering: "Answering",
	remaining: "Session time left",
	autoOffIdle: "Turned off automatically: no activity for 2 minutes.",
	autoOffCap: "Turned off automatically: 10 minute session cap reached.",
	settings: "Test settings",
	transcribeModel: "Transcription model",
	transcribeMode: "Transcription connection",
	modeToken: "Ephemeral token (browser direct)",
	modeRelay: "Relay via server",
	language: "Language",
	delay: "Transcription delay",
	ttsModel: "Speech model (TTS)",
	ttsVoice: "Voice",
	liveModel: "GPT-Live model",
	liveInstructions: "GPT-Live instructions (read exactly; empty = none)",
	endMethod: "End-of-utterance method",
	endVad: "Automatic (silence detection)",
	endManual: "Manual (button)",
	threshold: "Voice threshold",
	silence: "Silence that ends an utterance (ms)",
	echoCancellation: "Echo cancellation",
	noiseSuppression: "Noise suppression",
	microphone: "Microphone",
	defaultMic: "System default",
	deviceTest: "Device test",
	deviceTestIntro: "Check the microphone and WebRTC support before starting.",
	testMic: "Test microphone",
	stopTest: "Stop test",
	level: "Voice level",
	applied: "Applied by browser",
	webrtc: "WebRTC",
	webrtcOk: "Supported",
	webrtcFail: "Problem",
	conversation: "Conversation",
	emptyConversation: "No conversation yet. Turn it on and speak.",
	you: "You",
	claudeOriginal: "Original Claude text",
	gptLiveSpoken: "What GPT-Live said",
	pointerPresent: "Pointer action present",
	stateListening: "listening",
	stateTranscribing: "transcribing",
	stateThinking: "thinking",
	stateAnswering: "answering",
	stateDone: "done",
	stateInterrupted: "interrupted",
	stateError: "failed",
	metrics: "Measurements",
	metricTranscript: "End of speech → transcript",
	metricFirstToken: "→ first Claude token",
	metricFirstAudio: "→ first audio",
	metricAnswerAudio: "→ answer audio",
	fillerLabel: "Filler (before the answer)",
	metricOverlap: "Similarity",
	metricEnd: "End",
	turnCol: "Turn",
	pathCol: "Path",
	count: "n",
	noTurns: "No measurements yet.",
	includeText: "Include transcript & answer text",
	includeTextWarning:
		"Do not mention personal data (name, ID number, address, phone) while testing if the text will be exported.",
	copyJson: "Copy JSON",
	downloadJson: "Download JSON",
	copied: "Copied",
	clearMetrics: "Clear measurements",
	logs: "Stage log (no conversation content)",
	unknownEvents: "Unknown event types",
	sendMode: "Answer send mode (V1-B)",
	sendWhole: "Whole at once",
	sendSentence: "Per sentence",
	instructionsReset: "Use default instruction",
	instructionsTooLong: "Instruction exceeds the character limit",
	instructionsHint:
		"GPT-Live has no official verbatim mode; this instruction is best-effort and the result is checked automatically.",
	metricFirstSentence: "→ first chunk sent",
	metricMatch: "Number score",
	modeCol: "Mode",
	numbersChangedCol: "Numbers changed",
	modeV2: "V2",
	modeV1bWhole: "V1-B whole",
	modeV1bSentence: "V1-B per sentence",
	verifyNumbers: "Numbers matched",
	verifyNoNumbers: "Answer has no numbers",
	verifyChanged: "Numbers changed",
	verifyMissing: "Missing/changed",
	verifyExtra: "Extra in speech",
	verifyTerms: "Names/units not spoken",
	verifyPending: "Waiting for GPT-Live to finish speaking…",
	verifySkipped: "Not scored (turn interrupted)",
	chunksSent: "chunks",
};

export const voiceLabTexts = { id, en } as const;
