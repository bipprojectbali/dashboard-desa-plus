import Elysia, { t } from "elysia";
import { fetchApbdesEntriesRaw } from "./sources/apbdes";
import { mapKeuanganList } from "./transforms/keuangan-apbdes";

export const keuangan = new Elysia({ prefix: "/keuangan" }).get(
	"/apbdes-detail",
	async () => {
		try {
			const entries = await fetchApbdesEntriesRaw();
			const years = mapKeuanganList(entries);
			return {
				success: true,
				message: "Berhasil mendapatkan data keuangan APBDes",
				years,
			};
		} catch (err) {
			console.error("[Keuangan] Failed to fetch APBDes detail:", err);
		}

		return {
			success: false,
			message: "Gagal mengambil data keuangan APBDes",
			years: [],
		};
	},
	{
		response: {
			200: t.Object({
				success: t.Boolean(),
				message: t.String(),
				years: t.Array(
					t.Object({
						id: t.String(),
						tahun: t.Number(),
						name: t.String(),
						totalBudget: t.Number(),
						totalIncomeReal: t.Number(),
						totalExpenseReal: t.Number(),
						realisasiPercent: t.Number(),
						monthly: t.Array(
							t.Object({ income: t.Number(), expense: t.Number() }),
						),
						allocation: t.Array(
							t.Object({ sector: t.String(), amount: t.Number() }),
						),
						report: t.Object({
							income: t.Array(
								t.Object({ category: t.String(), amount: t.Number() }),
							),
							expenses: t.Array(
								t.Object({ category: t.String(), amount: t.Number() }),
							),
							totalIncome: t.Number(),
							totalExpense: t.Number(),
						}),
						aid: t.Array(
							t.Object({
								source: t.String(),
								amount: t.Number(),
								status: t.Union([t.Literal("cair"), t.Literal("proses")]),
							}),
						),
					}),
				),
			}),
		},
	},
);
