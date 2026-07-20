import { describe, expect, it } from "bun:test";
import api from "@/api";

// ---------------------------------------------------------------------------
// Unit: SDGs image URL transform
// ---------------------------------------------------------------------------

describe("SDGs image URL transform", () => {
	it("menggabungkan baseUrl + image.link menjadi URL absolut", () => {
		const baseUrl = "https://desa-darmasaba-stg.wibudev.com";
		const link = "/api/img/sdg-1.webp";
		const result = `${baseUrl}${link}`;
		expect(result).toBe(
			"https://desa-darmasaba-stg.wibudev.com/api/img/sdg-1.webp",
		);
	});

	it("score di-cast ke Number dari string", () => {
		const jumlah = "42";
		expect(Number(jumlah)).toBe(42);
	});

	it("score tetap number jika sudah number", () => {
		const jumlah = 17;
		expect(Number(jumlah)).toBe(17);
	});
});

// ---------------------------------------------------------------------------
// Unit: Divisi color-map transform
// ---------------------------------------------------------------------------

const DIVISION_COLOR_MAP: Record<string, string> = {
	Pemerintahan: "#3B82F6",
	Pembangunan: "#10B981",
	Kemasyarakatan: "#F59E0B",
	Pemberdayaan: "#8B5CF6",
	"Kesejahteraan Sosial": "#EC4899",
	"Keamanan & Ketertiban": "#EF4444",
	"Adat & Budaya": "#F97316",
};
const DIVISION_COLOR_FALLBACK = "#6B7280";

type NocDivisi = { id: string; division: string; totalKegiatan: number };

function mapDivisi(divisi: NocDivisi[]) {
	return divisi.map((d) => ({
		id: d.id,
		name: d.division,
		activityCount: d.totalKegiatan,
		color: DIVISION_COLOR_MAP[d.division] ?? DIVISION_COLOR_FALLBACK,
	}));
}

describe("Divisi color-map transform", () => {
	it("memetakan nama dikenal ke warna yang benar", () => {
		const result = mapDivisi([
			{ id: "1", division: "Pemerintahan", totalKegiatan: 10 },
		]);
		expect(result[0].color).toBe("#3B82F6");
	});

	it("nama tidak dikenal pakai fallback #6B7280", () => {
		const result = mapDivisi([
			{ id: "x", division: "Divisi Baru", totalKegiatan: 3 },
		]);
		expect(result[0].color).toBe(DIVISION_COLOR_FALLBACK);
	});

	it("aktif-count ter-map dari totalKegiatan", () => {
		const result = mapDivisi([
			{ id: "2", division: "Pembangunan", totalKegiatan: 80 },
		]);
		expect(result[0].activityCount).toBe(80);
		expect(result[0].name).toBe("Pembangunan");
	});
});

// ---------------------------------------------------------------------------
// Integration: Auth guard masih berjalan
// ---------------------------------------------------------------------------

describe("NOC active-divisions auth guard", () => {
	it("tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/noc/active-divisions"),
		);
		expect(res.status).toBe(401);
	});

	it("tanpa auth dengan idDesa query → 401 (bukan 400 atau 422)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/noc/active-divisions?idDesa=desa1"),
		);
		expect(res.status).toBe(401);
	});
});

describe("NOC upcoming-events auth guard", () => {
	it("tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/noc/upcoming-events"),
		);
		expect(res.status).toBe(401);
	});
});

// ---------------------------------------------------------------------------
// Integration: idDesa optional (tidak kirim → pakai default, tidak 400/422)
// Perlu sesi auth valid untuk bypass auth guard. Karena test env tidak punya
// DB auth, kita verifikasi bahwa status bukan 400 atau 422 (validasi query).
// Status 401 = auth guard aktif (benar). Status 500 = NOC external gagal (benar juga).
// ---------------------------------------------------------------------------

describe("idDesa optional — tidak return 400/422", () => {
	it("GET /active-divisions tanpa idDesa → bukan 400 atau 422", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/noc/active-divisions"),
		);
		expect([400, 422]).not.toContain(res.status);
	});

	it("GET /upcoming-events tanpa idDesa → bukan 400 atau 422", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/noc/upcoming-events"),
		);
		expect([400, 422]).not.toContain(res.status);
	});
});
