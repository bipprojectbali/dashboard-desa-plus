import Elysia, { t } from "elysia";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

type SearchRow = {
	id: string;
	title: string;
	snippet: string | null;
	rank: number;
};

const VALID_MODULES = ["complaint", "activity", "document"] as const;
type Module = (typeof VALID_MODULES)[number];

const MODULE_URL: Record<Module, string> = {
	complaint: "/pengaduan-layanan-publik",
	activity: "/kinerja-divisi",
	document: "/kinerja-divisi",
};

async function searchComplaints(q: string): Promise<SearchRow[]> {
	return prisma.$queryRaw<SearchRow[]>`
    SELECT
      id,
      title,
      LEFT(description, 150) AS snippet,
      ts_rank(
        to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'')),
        plainto_tsquery('simple', ${q})
      ) AS rank
    FROM "complaint"
    WHERE to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,''))
          @@ plainto_tsquery('simple', ${q})
    ORDER BY rank DESC
    LIMIT 20
  `;
}

async function searchActivities(q: string): Promise<SearchRow[]> {
	return prisma.$queryRaw<SearchRow[]>`
    SELECT
      id,
      title,
      LEFT(coalesce(description,''), 150) AS snippet,
      ts_rank(
        to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'')),
        plainto_tsquery('simple', ${q})
      ) AS rank
    FROM "activity"
    WHERE to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,''))
          @@ plainto_tsquery('simple', ${q})
    ORDER BY rank DESC
    LIMIT 20
  `;
}

async function searchDocuments(q: string): Promise<SearchRow[]> {
	return prisma.$queryRaw<SearchRow[]>`
    SELECT
      id,
      title,
      LEFT(coalesce(category::text,''), 150) AS snippet,
      ts_rank(
        to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(category::text,'')),
        plainto_tsquery('simple', ${q})
      ) AS rank
    FROM "document"
    WHERE to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(category::text,''))
          @@ plainto_tsquery('simple', ${q})
    ORDER BY rank DESC
    LIMIT 20
  `;
}

export const searchRoutes = new Elysia({ prefix: "/search" }).get(
	"/",
	async ({ query, set }) => {
		const q = (query.q ?? "").trim();
		const modulesParam = query.modules ?? "complaint,activity,document";
		const requestedModules = modulesParam
			.split(",")
			.map((m) => m.trim())
			.filter((m): m is Module => VALID_MODULES.includes(m as Module));

		if (q.length < 2) {
			return { results: [], total: 0 };
		}

		try {
			const queries: Promise<(SearchRow & { module: Module })[]>[] = [];

			if (requestedModules.includes("complaint")) {
				queries.push(
					searchComplaints(q).then((rows) =>
						rows.map((r) => ({ ...r, module: "complaint" as const })),
					),
				);
			}
			if (requestedModules.includes("activity")) {
				queries.push(
					searchActivities(q).then((rows) =>
						rows.map((r) => ({ ...r, module: "activity" as const })),
					),
				);
			}
			if (requestedModules.includes("document")) {
				queries.push(
					searchDocuments(q).then((rows) =>
						rows.map((r) => ({ ...r, module: "document" as const })),
					),
				);
			}

			const settled = await Promise.all(queries);
			const merged = settled.flat();

			merged.sort((a, b) => b.rank - a.rank);
			const limited = merged.slice(0, 20);

			const results = limited.map(({ rank: _rank, ...rest }) => ({
				...rest,
				snippet: rest.snippet ?? "",
				url: MODULE_URL[rest.module],
			}));

			return { results, total: results.length };
		} catch (error) {
			logger.error({ error }, "Search failed");
			set.status = 500;
			return { error: "Internal Server Error" };
		}
	},
	{
		query: t.Object({
			q: t.Optional(t.String()),
			modules: t.Optional(t.String()),
		}),
		response: {
			200: t.Union([
				t.Object({
					results: t.Array(
						t.Object({
							module: t.String(),
							id: t.String(),
							title: t.String(),
							snippet: t.String(),
							url: t.String(),
						}),
					),
					total: t.Number(),
				}),
				t.Object({ error: t.String() }),
			]),
		},
		detail: { summary: "Global full-text search across modules" },
	},
);
