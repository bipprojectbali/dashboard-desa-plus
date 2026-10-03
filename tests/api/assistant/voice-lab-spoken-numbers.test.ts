import { describe, expect, it } from "bun:test";
import {
	DEFAULT_SPOKEN_NUMBERS,
	READ_EXACT_INSTRUCTION,
} from "@/components/assistant/voice-lab/voice-lab.constants";
import { validateLiveInstructions } from "@/components/assistant/voice-lab/voice-lab.instructions";
import {
	formatSpokenNumbers,
	SPOKEN_MIN_VALUE,
	shortForm,
} from "@/components/assistant/voice-lab/voice-lab.spoken-numbers";
import { createAnswerSender } from "@/components/assistant/voice-lab/voice-lab.v1b-send";
import { verifyAnswer } from "@/components/assistant/voice-lab/voice-lab.verify";

const fmt = (s: string) => formatSpokenNumbers(s).text;

describe("pemformat angka lisan", () => {
	it("Rp / rupiah → ringkas + 'rupiah', 'sekitar' bila dibulatkan", () => {
		expect(fmt("Total anggaran Rp 940.248.688.")).toBe(
			"Total anggaran sekitar 940,2 juta rupiah.",
		);
		expect(fmt("Dana 1.250.000.000 rupiah cair.")).toBe(
			"Dana 1,25 miliar rupiah cair.",
		);
		expect(fmt("Dana Rp. 2.500.000 dan Rp1500000.")).toBe(
			"Dana 2,5 juta rupiah dan 1,5 juta rupiah.",
		);
	});

	it("juta / miliar / triliun, angka ',0' dibuang, skala naik saat pembulatan", () => {
		expect(fmt("1.250.000.000")).toBe("1,25 miliar");
		expect(fmt("3.400.000.000.000 rupiah")).toBe("3,4 triliun rupiah");
		expect(fmt("Ada 5.000.000 bibit")).toBe("Ada 5 juta bibit");
		expect(fmt("Ada 999.960.000 bibit")).toBe("Ada sekitar 1 miliar bibit");
		expect(shortForm(1_234_567_890)).toEqual({
			spoken: "1,23 miliar",
			spokenValue: 1_230_000_000,
			tolerance: 5_000_000,
		});
	});

	it("batas 999.999 vs 1.000.000", () => {
		expect(SPOKEN_MIN_VALUE).toBe(1_000_000);
		expect(fmt("Rp 999.999 dan 1.000.000 orang")).toBe(
			"Rp 999.999 dan 1 juta orang",
		);
	});

	it("tahun, persen, tanggal, nomor/ID, desimal kecil tidak disentuh", () => {
		const keep = [
			"Tahun 2026 naik 3,5%.",
			"Tanggal 03.10.2026 pukul 10.30.",
			"NIK 5103010101010001 dan nomor 1234567.",
			"Kenaikan 1.000.000% tidak wajar.",
			"Sudah 2.000.000 juta.",
			"Luas 0,75 hektar.",
		];
		for (const s of keep) expect(fmt(s)).toBe(s);
	});

	it("beberapa angka dalam satu kalimat + daftar konversinya", () => {
		const r = formatSpokenNumbers(
			"Pendapatan Rp 1.234.567.890, belanja Rp 940.248.688, sisa 12%.",
		);
		expect(r.text).toBe(
			"Pendapatan sekitar 1,23 miliar rupiah, belanja sekitar 940,2 juta rupiah, sisa 12%.",
		);
		expect(r.conversions.map((c) => [c.original, c.spoken])).toEqual([
			["Rp 1.234.567.890", "1,23 miliar"],
			["Rp 940.248.688", "940,2 juta"],
		]);
	});

	it("kata pendekatan yang sudah ada tidak digandakan; awal kalimat kapital", () => {
		expect(fmt("Kurang lebih 1.234.567 jiwa.")).toBe(
			"Kurang lebih 1,2 juta jiwa.",
		);
		expect(fmt("Rp 940.248.688 sudah cair.")).toBe(
			"Sekitar 940,2 juta rupiah sudah cair.",
		);
	});
});

describe("pencocokan dengan toleransi pembulatan", () => {
	const claude = "Total anggaran Rp 940.248.688.";
	const sent = formatSpokenNumbers(claude);

	it("ringkas terucap → cocok, konversi ditandai ✓", () => {
		const r = verifyAnswer(
			sent.text,
			"Total anggaran sekitar sembilan ratus empat puluh koma dua juta rupiah.",
			[],
			sent.conversions,
		);
		expect(r.score).toBe(1);
		expect(r.conversions).toEqual([
			{ spoken: "940,2 juta", original: "Rp 940.248.688", heard: true },
		]);
	});

	it("angka lengkap asli yang terucap juga dalam toleransi", () => {
		const r = verifyAnswer(
			sent.text,
			"Total anggaran 940 juta 248 ribu 688 rupiah.",
			[],
			sent.conversions,
		);
		expect(r.score).toBe(1);
	});

	it("di luar toleransi → berubah, konversi ✗", () => {
		const r = verifyAnswer(
			sent.text,
			"Total anggaran sekitar 940 juta rupiah.",
			[],
			sent.conversions,
		);
		expect(r.score).toBe(0);
		expect(r.numbersChanged).toBe(true);
		expect(r.conversions[0]?.heard).toBe(false);
	});

	it("tanpa konversi tetap cocok persis seperti sebelumnya", () => {
		expect(verifyAnswer(claude, "Total anggaran 940 juta rupiah.").score).toBe(
			0,
		);
		expect(verifyAnswer(claude, claude).conversions).toEqual([]);
	});
});

describe("toggle pemformat di pengirim", () => {
	const run = (spokenNumbers: boolean) => {
		const sent: string[] = [];
		const sender = createAnswerSender({
			mode: "sentence",
			send: (c) => sent.push(c),
			isCancelled: () => false,
			transform: spokenNumbers ? (p) => formatSpokenNumbers(p).text : undefined,
		});
		sender.delta("Total anggaran Rp 940.248.688. Sisa");
		sender.delta(" dana 12% lagi.");
		sender.finish("Total anggaran Rp 940.248.688. Sisa dana 12% lagi.");
		return sent;
	};

	it("aktif (default): angka diringkas per kalimat sebelum dikirim", () => {
		expect(DEFAULT_SPOKEN_NUMBERS).toBe(true);
		expect(run(true)).toEqual([
			"Total anggaran sekitar 940,2 juta rupiah.",
			"Sisa dana 12% lagi.",
		]);
	});

	it("mati: teks Claude dikirim apa adanya", () => {
		expect(run(false)).toEqual([
			"Total anggaran Rp 940.248.688.",
			"Sisa dana 12% lagi.",
		]);
	});

	it("instruksi bawaan memuat aturan angka ringkas dan tetap ≤ batas", () => {
		expect(READ_EXACT_INSTRUCTION).toContain("940,2 juta");
		expect(validateLiveInstructions(READ_EXACT_INSTRUCTION)).toBeNull();
	});
});
