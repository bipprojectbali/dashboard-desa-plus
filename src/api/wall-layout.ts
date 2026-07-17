import Elysia, { t } from "elysia";
import { Prisma } from "generated/prisma";
import {
	validateLayout,
	validateSizes,
	WALL_LAYOUT_ID,
	type WallSizeMap,
} from "@/components/wall/wall-layout-utils";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

/** Bentuk t.Object satu geometri override (w×h span). Divalidasi ulang di handler. */
const geomSchema = t.Object({ w: t.Number(), h: t.Number() });

/**
 * Layout video wall (`/wall`) — singleton global (satu baris `id="singleton"`).
 *
 * GET publik & READ-ONLY: TV kiosk (tanpa login) membacanya via carve-out di
 * apiMiddleware. TIDAK upsert — endpoint anonim tak boleh menulis (write-on-read
 * bug). DB kosong → balikin `order: []`, klien resolve ke DEFAULT_LAYOUT.
 *
 * PUT admin-only: hanya `order` (array widget id, TANPA PII) yang disimpan.
 * Guard role di handler (pola noc.ts) karena carve-out cuma buka GET.
 */
export const wallLayout = new Elysia({ prefix: "/wall-layout" })
	.use(apiMiddleware)
	.get(
		"/",
		async ({ set }) => {
			try {
				const row = await prisma.wallLayout.findUnique({
					where: { id: WALL_LAYOUT_ID },
					select: { order: true, sizes: true },
				});
				// null (belum pernah di-set) → order kosong; klien yang backfill default.
				// sizes Json? → cast ke peta; null saat belum ada override.
				return {
					data: {
						order: row?.order ?? [],
						sizes: (row?.sizes as WallSizeMap | null) ?? null,
					},
				};
			} catch (error) {
				logger.error({ error }, "Failed to get wall layout");
				set.status = 500;
				return { error: "Failed to get wall layout" };
			}
		},
		{
			response: {
				200: t.Object({
					data: t.Object({
						order: t.Array(t.String()),
						sizes: t.Union([t.Record(t.String(), geomSchema), t.Null()]),
					}),
				}),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Get global wall layout (public, read-only)" },
		},
	)
	.put(
		"/",
		async ({ body, set, user }) => {
			// Carve-out hanya membuka GET; PUT tanpa user sudah 401 di middleware.
			// Guard role di sini karena middleware cuma bedakan ada/tidaknya sesi.
			if (!user || user.role !== "admin") {
				set.status = 401;
				return { error: "Unauthorized" };
			}

			const sizes = (body.sizes as WallSizeMap | null | undefined) ?? null;
			const check = validateLayout(body.order);
			const sizeCheck = validateSizes(sizes);
			if (!check.ok || !sizeCheck.ok) {
				set.status = 422;
				return { error: [...check.errors, ...sizeCheck.errors].join("; ") };
			}

			// Kolom `sizes` Json?: nilai objek → simpan; null (tak ada override) →
			// DbNull agar kolom benar-benar NULL, bukan literal JSON `null`.
			// sizes = { [id]: {w,h} } — JSON-aman; cast karena Record<string,…> tak
			// otomatis di-infer sebagai InputJsonValue oleh Prisma.
			const sizesValue: Prisma.InputJsonValue | typeof Prisma.DbNull = sizes
				? (sizes as unknown as Prisma.InputJsonValue)
				: Prisma.DbNull;

			try {
				await prisma.wallLayout.upsert({
					where: { id: WALL_LAYOUT_ID },
					create: {
						id: WALL_LAYOUT_ID,
						order: body.order,
						sizes: sizesValue,
						updatedBy: user.id,
					},
					update: {
						order: body.order,
						sizes: sizesValue,
						updatedBy: user.id,
					},
				});
				logger.info({ userId: user.id }, "Wall layout updated");
				return { data: { order: body.order, sizes } };
			} catch (error) {
				logger.error({ error, userId: user.id }, "Failed to save wall layout");
				set.status = 500;
				return { error: "Failed to save wall layout" };
			}
		},
		{
			body: t.Object({
				order: t.Array(t.String()),
				sizes: t.Optional(
					t.Union([t.Record(t.String(), geomSchema), t.Null()]),
				),
			}),
			// 401 sengaja TIDAK dideklarasi: middleware apiMiddleware yang balikin
			// 401 `{message}` untuk request tanpa sesi — kalau dideklarasi di sini
			// dengan shape `{error}`, Elysia validasi respons middleware itu dan
			// gagal jadi 422. Biarkan lolos (pola sama seperti akses-preferences).
			response: {
				200: t.Object({
					data: t.Object({
						order: t.Array(t.String()),
						sizes: t.Union([t.Record(t.String(), geomSchema), t.Null()]),
					}),
				}),
				422: t.Object({ error: t.String() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Save global wall layout (admin-only)" },
		},
	);
