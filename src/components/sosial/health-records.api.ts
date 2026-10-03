import { apiClient } from "@/utils/api-client";
import type { RiwayatWargaResponse } from "./health-records.types";

const EMPTY_RIWAYAT: RiwayatWargaResponse = {
	banjarList: [],
	ibuHamil: [],
	balita: [],
	penyakit: [],
};

/**
 * Ambil seluruh data riwayat kesehatan warga lewat proxy internal
 * (`/api/sosial/kesehatan/riwayat-warga`). Fetch langsung ke Desa API dari
 * browser diblokir CORS, jadi datanya diambil server-side. Server sudah
 * meratakan tiap dataset ke array, filter per-banjar & paginasi di klien.
 */
export async function fetchRiwayatWarga(): Promise<RiwayatWargaResponse> {
	const res = await apiClient.GET("/api/sosial/kesehatan/riwayat-warga");
	const body = res.data as
		| { success: boolean; data: RiwayatWargaResponse | null }
		| undefined;
	if (!body?.success || !body.data) {
		throw new Error("Gagal memuat data riwayat kesehatan warga");
	}
	return { ...EMPTY_RIWAYAT, ...body.data };
}
