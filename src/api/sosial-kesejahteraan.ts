import { Elysia, t } from "elysia";
import { TTL, withCache } from "@/utils/cache";
import { getEnv } from "@/utils/env";
import logger from "@/utils/logger";

// File terpisah dari sosial.ts (sudah >350 baris, di atas batas 150 baris/
// route-handler) agar penambahan endpoint kesejahteraan tidak memperbesar
// file yang sudah over-limit.
const DESA_API_URL = getEnv(
	"DESA_API_URL",
	"https://desa-darmasaba-stg.wibudev.com",
).replace(/\/+$/, "");

/** Buang tag HTML dari deskripsi/content Desa API sebelum dikirim ke klien. */
function stripHtml(html: string | null | undefined): string {
	if (!html) return "";
	return html
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

interface KesejahteraanProgram {
	id: string;
	judul: string;
	deskripsi: string | null;
	isActive: boolean;
}

export const sosialKesejahteraan = new Elysia({
	prefix: "/sosial/kesejahteraan",
}).get(
	"/find-many",
	async ({ set }) => {
		try {
			const data = await withCache(
				"sosial:kesejahteraan:list",
				TTL.SOSIAL,
				async () => {
					const r = await fetch(
						`${DESA_API_URL}/api/ekonomi/kesejahteraanmasyarakat/find-many?limit=50`,
					);
					if (!r.ok) throw new Error(`Desa API HTTP ${r.status}`);
					const json = await r.json();
					if (!json.success) {
						throw new Error(json.message ?? "Desa API returned success=false");
					}
					const rows: Array<{
						id: string;
						judul: string;
						deskripsi: string | null;
						isActive: boolean;
					}> = Array.isArray(json.data) ? json.data : [];
					return rows
						.filter((row) => row.isActive)
						.map(
							(row): KesejahteraanProgram => ({
								id: row.id,
								judul: row.judul,
								deskripsi: stripHtml(row.deskripsi),
								isActive: row.isActive,
							}),
						);
				},
			);
			return { success: true, data };
		} catch (error) {
			logger.error({ error }, "Failed to proxy sosial kesejahteraan list");
			set.status = 500;
			return { success: false, error: "Internal Server Error", data: null };
		}
	},
	{
		response: {
			200: t.Object({
				success: t.Boolean(),
				data: t.Any(),
				error: t.Optional(t.String()),
			}),
			500: t.Object({
				success: t.Boolean(),
				error: t.String(),
				data: t.Null(),
			}),
		},
	},
);
