import { describe, expect, it } from "bun:test";
import { parseNumberWords } from "@/components/assistant/voice-lab/voice-lab.number-words";
import {
	extractNumbers,
	extractWordNumbers,
	parseDigitNumber,
} from "@/components/assistant/voice-lab/voice-lab.numbers";
import {
	createSentenceStream,
	splitSentences,
} from "@/components/assistant/voice-lab/voice-lab.sentences";
import { verifyAnswer } from "@/components/assistant/voice-lab/voice-lab.verify";

const words = (s: string) => s.split(" ");

describe("pemecah kalimat id-ID", () => {
	it("tidak memotong di desimal, ribuan, Rp, atau persen", () => {
		expect(
			splitSentences(
				"Jumlah penduduk 1.234.567 jiwa. Anggaran Rp. 2,5 juta naik 3,5%. Selesai tanpa titik",
			),
		).toEqual([
			"Jumlah penduduk 1.234.567 jiwa.",
			"Anggaran Rp. 2,5 juta naik 3,5%.",
			"Selesai tanpa titik",
		]);
	});

	it("tidak memotong di singkatan; 'dll.' berakhir hanya sebelum huruf besar", () => {
		expect(
			splitSentences(
				"Kepala desa Dr. Made hadir. Data dll. masih dihitung. Tersedia di Jl. Raya, dll. Berikutnya ada lagi.",
			),
		).toEqual([
			"Kepala desa Dr. Made hadir.",
			"Data dll. masih dihitung.",
			"Tersedia di Jl. Raya, dll.",
			"Berikutnya ada lagi.",
		]);
	});

	it("penomoran daftar tidak dianggap akhir kalimat", () => {
		expect(
			splitSentences(
				"Rinciannya:\n1. Banjar Tengah 300 KK.\n2. Banjar Kaja 250 KK.",
			),
		).toEqual([
			"Rinciannya: 1. Banjar Tengah 300 KK.",
			"2. Banjar Kaja 250 KK.",
		]);
	});

	it("kalimat sangat pendek digabung ke kalimat berikutnya", () => {
		expect(splitSentences("Baik. Jumlah KK ada 120.")).toEqual([
			"Baik. Jumlah KK ada 120.",
		]);
	});

	it("stream menunggu karakter berikutnya sebelum memutus angka di batas potongan", () => {
		const stream = createSentenceStream();
		expect(stream.push("Total anggaran Rp. 1.")).toEqual([]);
		expect(stream.push("500.000 sudah cair. Sisa")).toEqual([
			"Total anggaran Rp. 1.500.000 sudah cair.",
		]);
		expect(stream.push(" 20% lagi.")).toEqual([]);
		expect(stream.flush()).toEqual(["Sisa 20% lagi."]);
	});

	it("reset membuang sisa buffer", () => {
		const stream = createSentenceStream();
		stream.push("Saya cek datanya dulu");
		stream.reset();
		expect(stream.flush()).toEqual([]);
	});
});

describe("ekstraksi angka", () => {
	it("format digit id-ID", () => {
		expect(parseDigitNumber("1.234.567")).toEqual({
			value: 1234567,
			alt: null,
		});
		expect(parseDigitNumber("2,5")).toEqual({ value: 2.5, alt: null });
		expect(parseDigitNumber("1.234,56")).toEqual({ value: 1234.56, alt: null });
		expect(parseDigitNumber("2.025")).toEqual({ value: 2025, alt: 2.025 });
		expect(parseDigitNumber("1,2,3")).toBeNull();
		expect(parseDigitNumber("abc")).toBeNull();
	});

	it("kata bilangan", () => {
		expect(parseNumberWords(words("dua ribu dua puluh lima"))).toBe(2025);
		expect(parseNumberWords(words("dua koma lima"))).toBe(2.5);
		expect(parseNumberWords(words("dua koma lima juta"))).toBe(2_500_000);
		expect(parseNumberWords(words("seratus dua puluh"))).toBe(120);
		expect(parseNumberWords(words("dua juta lima ratus ribu"))).toBe(2_500_000);
		expect(parseNumberWords(words("sebelas"))).toBe(11);
		expect(parseNumberWords(words("dua belas"))).toBe(12);
		expect(parseNumberWords(words("dua nol dua lima"))).toBe(2025);
		expect(parseNumberWords(words("dua tiga puluh"))).toBeNull();
	});

	it("pengali skala diterapkan dan tidak terhitung dua kali", () => {
		expect(
			extractNumbers("Penduduk 2,5 juta jiwa, naik 12%.").map((n) => n.value),
		).toEqual([2_500_000, 12]);
	});

	it("juta/miliar/triliun diucapkan dengan kata", () => {
		expect(
			parseNumberWords(
				words(
					"sembilan ratus empat puluh juta dua ratus empat puluh delapan ribu enam ratus delapan puluh delapan",
				),
			),
		).toBe(940_248_688);
		expect(
			parseNumberWords(words("satu miliar dua ratus lima puluh juta")),
		).toBe(1_250_000_000);
		expect(parseNumberWords(words("dua triliun tiga ratus miliar"))).toBe(
			2_300_000_000_000,
		);
	});

	it("campuran digit + skala jadi satu angka", () => {
		expect(
			extractNumbers("940 juta 248 ribu 688 rupiah").map((n) => n.value),
		).toEqual([940_248_688]);
		expect(
			extractNumbers("sembilan ratus empat puluh juta 248 ribu").map(
				(n) => n.value,
			),
		).toEqual([940_248_000]);
	});

	it("deret kata skala saja / digit berdampingan tidak digabung", () => {
		expect(extractWordNumbers("juta ribu rupiah")).toEqual([]);
		expect(extractNumbers("tahun 2025 2026").map((n) => n.value)).toEqual([
			2025, 2026,
		]);
		expect(
			extractNumbers("Ada 2 juta. 3 orang hadir.").map((n) => n.value),
		).toEqual([2_000_000, 3]);
	});

	it("'satu' yang berdiri sendiri diabaikan", () => {
		expect(extractWordNumbers("satu-satunya banjar")).toEqual([]);
		expect(extractWordNumbers("ada tiga banjar").map((n) => n.value)).toEqual([
			3,
		]);
	});
});

describe("pencocokan jawaban", () => {
	it("cocok: angka digit vs angka terucap, satuan & nama tetap", () => {
		const r = verifyAnswer(
			"Penduduk **Darmasaba** 1.234 jiwa, anggaran Rp 2,5 juta.",
			"Penduduk Darmasaba seribu dua ratus tiga puluh empat jiwa, anggaran dua koma lima juta rupiah.",
			["Darmasaba"],
		);
		expect(r).toMatchObject({
			numbersTotal: 2,
			numbersMatched: 2,
			score: 1,
			missingNumbers: [],
			extraNumbers: [],
			missingTerms: [],
			numbersChanged: false,
		});
	});

	it("separator gaya Inggris di transkrip tetap cocok", () => {
		const r = verifyAnswer(
			"Ada 1.500 jiwa dan 2,5 hektar.",
			"Ada 1,500 jiwa dan 2.5 hektar.",
		);
		expect(r.score).toBe(1);
	});

	it("berubah: angka beda ditandai hilang + tambahan", () => {
		const r = verifyAnswer(
			"Ada 120 KK di Banjar Tengah.",
			"Ada seratus dua puluh lima KK di Banjar Tengah.",
		);
		expect(r.score).toBe(0);
		expect(r.missingNumbers).toEqual(["120"]);
		expect(r.extraNumbers).toEqual(["seratus dua puluh lima"]);
		expect(r.numbersChanged).toBe(true);
	});

	it("hilang: angka & satuan yang tidak diucapkan", () => {
		const r = verifyAnswer(
			"Ada 120 KK dan 45 jiwa.",
			"Ada seratus dua puluh KK.",
		);
		expect(r.numbersMatched).toBe(1);
		expect(r.score).toBe(0.5);
		expect(r.missingNumbers).toEqual(["45"]);
		expect(r.missingTerms).toEqual(["jiwa"]);
		expect(r.numbersChanged).toBe(true);
	});

	it("tambahan: ucapan memuat angka yang tidak ada di jawaban Claude", () => {
		const r = verifyAnswer(
			"Anggaran naik tahun ini.",
			"Anggaran naik 10 persen tahun ini.",
		);
		expect(r.score).toBeNull();
		expect(r.extraNumbers).toEqual(["10"]);
		expect(r.numbersChanged).toBe(true);
	});

	it("angka besar terucap utuh cocok; 'ribu' berlebih di akhir ditandai berubah", () => {
		const claude = "Total anggaran Rp 940.248.688.";
		const full =
			"Total anggaran sembilan ratus empat puluh juta dua ratus empat puluh delapan ribu enam ratus delapan puluh delapan rupiah.";
		expect(verifyAnswer(claude, full).score).toBe(1);
		expect(
			verifyAnswer(claude, "Total anggaran 940 juta 248 ribu 688 rupiah.")
				.score,
		).toBe(1);
		const wrong = verifyAnswer(
			claude,
			full.replace("delapan rupiah", "delapan ribu rupiah"),
		);
		expect(wrong.score).toBe(0);
		expect(wrong.numbersChanged).toBe(true);
	});

	it("nama dari daftar istilah yang tidak disebut ikut dilaporkan", () => {
		const r = verifyAnswer(
			"Data Banjar Tengah sudah lengkap.",
			"Data sudah lengkap.",
			["Banjar Tengah", "Kesehatan", "Kesehatan", "ab"],
		);
		expect(r.missingTerms).toEqual(["Banjar Tengah"]);
		expect(r.score).toBeNull();
		expect(r.numbersChanged).toBe(false);
	});
});
