import { WALL_CATEGORICAL } from "@/components/wall/wall-theme";
import type { WallSosial } from "@/types/wall";
import { TTL, withCache } from "@/utils/cache";
import { desaExternalClient } from "@/utils/desa-external-client";
import { getEnv } from "@/utils/env";

const DESA_API_URL = getEnv(
	"DESA_API_URL",
	"https://desa-darmasaba-stg.wibudev.com",
).replace(/\/+$/, "");

/** Ekstrak jam dari string jadwal posyandu (e.g. "08:00 - 10:00" → "08:00"). */
function extractTime(jadwal: string | undefined | null): string {
	if (!jadwal) return "";
	const match = jadwal.match(/\d{1,2}:\d{2}/);
	return match?.[0] ?? "";
}

async function fetchKesehatanStats(): Promise<{
	kpi: WallSosial["kpi"];
	kesehatan: WallSosial["kesehatan"];
}> {
	const raw = await withCache(
		"sosial:kesehatan:stats",
		TTL.SOSIAL,
		async () => {
			const response = await desaExternalClient.GET(
				"/api/kesehatan/ringkasankesehatan/stats",
			);
			if (response.error) throw new Error(String(response.error));
			return response.data?.data ?? null;
		},
	);

	// biome-ignore lint/suspicious/noExplicitAny: Desa API response shape not in generated types
	const d = raw as any;
	const kpi: WallSosial["kpi"] = {
		ibuHamilAktif: Number(d?.ibuHamil?.totalAktif ?? d?.ibuHamil?.total ?? 0),
		balitaTerdaftar: Number(d?.balita?.totalTerdaftar ?? d?.balita?.total ?? 0),
		alertStunting: Number(d?.stunting?.total ?? d?.alertStunting ?? 0),
		posyanduAktif: Number(d?.posyandu?.aktif ?? d?.posyanduAktif ?? 0),
	};

	const labels = [
		{ key: "ibuHamil", label: "Ibu Hamil Aktif" },
		{ key: "balita", label: "Balita Terdaftar" },
		{ key: "stunting", label: "Alert Stunting" },
	];
	const kesehatan: WallSosial["kesehatan"] = labels.map((l, i) => {
		const section = d?.[l.key];
		const value = Number(
			section?.totalAktif ?? section?.totalTerdaftar ?? section?.total ?? 0,
		);
		const rawMax = Number(
			section?.totalTerdaftar ?? section?.totalAktif ?? section?.total ?? value,
		);
		const max = rawMax > 0 ? rawMax : 1;
		return {
			label: l.label,
			value: max > 0 ? Math.round((value / max) * 100) : 0,
			color: WALL_CATEGORICAL[i % WALL_CATEGORICAL.length] as string,
		};
	});

	return { kpi, kesehatan };
}

async function fetchPosyandu(): Promise<WallSosial["posyandu"]> {
	const raw = await withCache("sosial:posyandu:list", TTL.SOSIAL, async () => {
		const response = await desaExternalClient.GET(
			"/api/kesehatan/posyandu/find-many",
		);
		if (response.error) throw new Error(String(response.error));
		return response.data?.data ?? null;
	});

	// biome-ignore lint/suspicious/noExplicitAny: Desa API response shape not in generated types
	const rows: any[] = Array.isArray(raw) ? raw : ((raw as any)?.data ?? []);
	return rows
		.filter((r) => r?.isActive !== false)
		.slice(0, 10)
		.map((r) => ({
			id: String(r.id ?? r._id ?? ""),
			name: String(r.name ?? r.nama ?? "Posyandu"),
			jadwal: String(r.jadwal ?? r.schedule ?? ""),
			time: extractTime(r.jadwal ?? r.schedule),
		}));
}

async function fetchPendidikan(): Promise<WallSosial["pendidikan"]> {
	const raw = await withCache(
		"sosial:pendidikan:stats",
		TTL.SOSIAL,
		async () => {
			const response = await desaExternalClient.GET(
				"/api/pendidikan/ringkasan/stats",
			);
			if (response.error) throw new Error(String(response.error));
			return response.data?.data ?? null;
		},
	);

	// biome-ignore lint/suspicious/noExplicitAny: Desa API response shape not in generated types
	const d = raw as any;
	// biome-ignore lint/suspicious/noExplicitAny: Desa API response shape not in generated types
	const perJenjang: Array<{ nama: string; jumlahSiswa: number }> =
		Array.isArray(d?.perJenjang ?? d?.byLevel)
			? (d.perJenjang ?? d.byLevel).map((j: any) => ({
					nama: String(j.nama ?? j.level ?? j.jenjang ?? ""),
					jumlahSiswa: Number(j.jumlahSiswa ?? j.siswa ?? j.count ?? 0),
				}))
			: [];

	return {
		perJenjang,
		jumlahLembaga: Number(d?.jumlahLembaga ?? d?.totalLembaga ?? 0),
		jumlahPengajar: Number(d?.jumlahPengajar ?? d?.totalPengajar ?? 0),
	};
}

async function fetchBeasiswa(): Promise<WallSosial["beasiswa"]> {
	return withCache("sosial:beasiswa:stats", TTL.SOSIAL, async () => {
		const r = await fetch(
			`${DESA_API_URL}/api/pendidikan/beasiswa/beasiswapendaftar/findMany?limit=500`,
		);
		if (!r.ok) throw new Error(`Desa API HTTP ${r.status}`);
		const json = await r.json();
		if (!json.success) {
			throw new Error(json.message ?? "Desa API returned success=false");
		}

		const rows: Array<{ jenisKelamin?: string; createdAt?: string }> =
			Array.isArray(json.data) ? json.data : [];

		const lakiLaki = rows.filter(
			(row) => row.jenisKelamin === "LAKI_LAKI",
		).length;
		const perempuan = rows.filter(
			(row) => row.jenisKelamin === "PEREMPUAN",
		).length;

		const years = rows
			.map((row) =>
				row.createdAt ? new Date(row.createdAt).getFullYear() : null,
			)
			.filter((y): y is number => y !== null);
		const periode = years.length > 0 ? String(Math.max(...years)) : null;

		return {
			total: json.total ?? rows.length,
			lakiLaki,
			perempuan,
			periode,
		};
	});
}

async function fetchEvent(): Promise<WallSosial["event"]> {
	const raw = await withCache(
		"sosial:event-budaya:upcoming",
		TTL.SOSIAL,
		async () => {
			const response = await desaExternalClient.GET(
				"/api/desa/eventbudaya/find-upcoming",
			);
			if (response.error) throw new Error(String(response.error));
			return response.data?.data ?? null;
		},
	);

	// biome-ignore lint/suspicious/noExplicitAny: Desa API response shape not in generated types
	const rows: any[] = Array.isArray(raw) ? raw : ((raw as any)?.data ?? []);
	return rows.slice(0, 8).map((r) => ({
		id: String(r.id ?? r._id ?? ""),
		title: String(r.title ?? r.nama ?? r.name ?? ""),
		startDate: String(r.startDate ?? r.tanggal ?? r.date ?? ""),
		location: String(r.location ?? r.lokasi ?? r.tempat ?? ""),
	}));
}

/**
 * Builder slice Sosial. Parallel-fetch 5 sumber dari Desa API server-side
 * (shared cache key sosial:* agar tidak double-fetch bersama src/api/sosial.ts).
 * Tanpa PII: riwayat kesehatan warga tidak diambil.
 */
export async function buildSosial(): Promise<WallSosial> {
	const [kesehatanResult, posyandu, pendidikan, beasiswa, event] =
		await Promise.all([
			fetchKesehatanStats(),
			fetchPosyandu(),
			fetchPendidikan(),
			fetchBeasiswa(),
			fetchEvent(),
		]);

	return {
		kpi: kesehatanResult.kpi,
		kesehatan: kesehatanResult.kesehatan,
		posyandu,
		pendidikan,
		beasiswa,
		event,
	};
}
