import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import Elysia, { t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { auth } from "../utils/auth";
import { apikey } from "./apikey";
import { complaint } from "./complaint";
import { dashboard } from "./dashboard";
import { demografi } from "./demografi";
import { division } from "./division";
import { event } from "./event";
import { noc } from "./noc";
import { profile } from "./profile";
import { resident } from "./resident";

const isProduction = process.env.NODE_ENV === "production";

const api = new Elysia({
	prefix: "/api",
})
	.use(cors())
	.get("/health", () => ({ ok: true }), {
		response: {
			200: t.Object({ ok: t.Boolean() }),
		},
	})
	.get(
		"/version",
		async () => {
			const pkg = await Bun.file("package.json").json() as { version: string };
			return { version: pkg.version };
		},
		{
			response: {
				200: t.Object({ version: t.String() }),
			},
		},
	)
	.all("/auth/*", ({ request }) => auth.handler(request))
	.get(
		"/session",
		async ({ request }) => {
			const data = await auth.api.getSession({ headers: request.headers });
			return { data };
		},
		{
			response: {
				200: t.Object({ data: t.Any() }),
			},
		},
	)
	.use(apiMiddleware)
	.use(noc)
	.use(apikey)
	.use(profile)
	.use(division)
	.use(complaint)
	.use(resident)
	.use(event)
	.use(dashboard)
	.use(demografi);

if (!isProduction) {
	api.use(
		swagger({
			path: "/docs",
			documentation: {
				info: {
					title: "Bun + React API",
					version: "1.0.0",
				},
			},
		}),
	);
}

export default api;
