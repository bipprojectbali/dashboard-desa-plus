import { Elysia, t } from "elysia";
import { prisma } from "../utils/db";

export const dashboard = new Elysia({ prefix: "/dashboard" })
	.get(
		"/budget",
		async () => {
			const data = await prisma.budget.findMany({
				where: { fiscalYear: 2025 },
				orderBy: { category: "asc" },
			});
			return { data };
		},
		{
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							category: t.String(),
							amount: t.Number(),
							percentage: t.Number(),
							color: t.String(),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/sdgs",
		async () => {
			const data = await prisma.sdgsScore.findMany({
				orderBy: { score: "desc" },
			});
			return { data };
		},
		{
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							title: t.String(),
							score: t.Number(),
							image: t.Nullable(t.String()),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/satisfaction",
		async () => {
			const data = await prisma.satisfactionRating.findMany({
				orderBy: { value: "desc" },
			});
			return { data };
		},
		{
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							category: t.String(),
							value: t.Number(),
							color: t.String(),
						}),
					),
				}),
			},
		},
	);
