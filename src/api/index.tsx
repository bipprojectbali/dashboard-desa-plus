import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import Elysia from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { auth } from "../utils/auth";
import { apikey } from "./apikey";
import { complaint } from "./complaint";
import { division } from "./division";
import { event } from "./event";
import { profile } from "./profile";
import { resident } from "./resident";

const isProduction = process.env.NODE_ENV === "production";

const api = new Elysia({
	prefix: "/api",
})
	.use(cors())
	.get("/health", () => ({ ok: true }))
	.all("/auth/*", ({ request }) => auth.handler(request))
	.get("/session", async ({ request }) => {
		const data = await auth.api.getSession({ headers: request.headers });
		return { data };
	})
	.use(apiMiddleware)
	.use(apikey)
	.use(profile)
	.use(division)
	.use(complaint)
	.use(resident)
	.use(event);

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
