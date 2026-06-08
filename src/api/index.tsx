import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import Elysia, { t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { auth } from "../utils/auth";
import { prisma } from "../utils/db";
import { activityLog } from "./activity-log";
import { adminApi } from "./admin";
import { adminFaqApi } from "./admin-faq";
import { aksesPreferences } from "./akses-preferences";
import { apikey } from "./apikey";
import { bantuanApi } from "./bantuan";
import { bumdes } from "./bumdes";
import { complaint } from "./complaint";
import { dashboard } from "./dashboard";
import { demografi } from "./demografi";
import { division } from "./division";
import { event } from "./event";
import { invitationRoutes } from "./invitation";
import { ipWhitelist } from "./ip-whitelist";
import { jennaChat } from "./jenna";
import { keamanan } from "./keamanan";
import { keamananPreferences } from "./keamanan-preferences";
import { myPermissions } from "./my-permissions";
import { noc } from "./noc";
import { notificationPreferences } from "./notification-preferences";
import { profile } from "./profile";
import { resident } from "./resident";
import { searchRoutes } from "./search";
import { sosial } from "./sosial";
import { syncLog } from "./sync-log";
import { systemStatsRoutes } from "./system-stats";
import { umkm } from "./umkm";
import { umumPreferences } from "./umum-preferences";

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
			const pkg = (await Bun.file("package.json").json()) as {
				version: string;
			};
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
			if (data?.user?.id) {
				const userExists = await prisma.user.findUnique({
					where: { id: data.user.id },
					select: { id: true },
				});
				if (!userExists) return { data: null };
			}
			return { data };
		},
		{
			response: {
				200: t.Object({ data: t.Any() }),
			},
		},
	)
	.use(apiMiddleware)
	.use(adminApi)
	.use(noc)
	.use(apikey)
	.use(profile)
	.use(division)
	.use(complaint)
	.use(resident)
	.use(event)
	.use(dashboard)
	.use(demografi)
	.use(notificationPreferences)
	.use(umkm)
	.use(bumdes)
	.use(umumPreferences)
	.use(keamanan)
	.use(keamananPreferences)
	.use(aksesPreferences)
	.use(jennaChat)
	.use(systemStatsRoutes)
	.use(activityLog)
	.use(invitationRoutes)
	.use(ipWhitelist)
	.use(searchRoutes)
	.use(sosial)
	.use(syncLog)
	.use(bantuanApi)
	.use(adminFaqApi)
	.use(myPermissions);

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
