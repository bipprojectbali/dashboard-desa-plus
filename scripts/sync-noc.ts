import { prisma } from "../src/utils/db";
import { nocExternalClient } from "../src/utils/noc-external-client";
import logger from "../src/utils/logger";

const ID_DESA = "desa1";

/**
 * Helper untuk mendapatkan system user ID untuk relasi
 */
async function getSystemUserId() {
	const user = await prisma.user.findFirst({
		where: { role: "admin" },
	});
	if (!user) {
		// Buat system user jika tidak ada
		const newUser = await prisma.user.create({
			data: {
				email: "system@desa1.id",
				name: "System Sync",
				role: "admin",
			},
		});
		return newUser.id;
	}
	return user.id;
}

/**
 * 1. Sync Divisions
 */
async function syncActiveDivisions() {
	logger.info("Syncing Divisions...");
	const { data, error } = await nocExternalClient.GET("/api/noc/active-divisions", {
		params: { query: { idDesa: ID_DESA } },
	});

	if (error || !data) {
		logger.error({ error }, "Failed to fetch divisions from NOC");
		throw new Error("Failed to fetch divisions from NOC");
	}

	// biome-ignore lint/suspicious/noExplicitAny: External API response is untyped
	const resData = (data as any).data;
	const divisions = Array.isArray(resData) ? resData : (resData?.divisi || []);
	
	if (!Array.isArray(divisions)) {
		logger.warn({ data }, "Divisions data from NOC is not an array");
		return;
	}

	for (const div of divisions) {
		const name = div.name || div.division;
		const extId = div.id || div.externalId || `div-${name.toLowerCase().replace(/\s+/g, "-")}`;
		const activityCount = div.activityCount || div.totalKegiatan || 0;
		
		await prisma.division.upsert({
			where: { name: name },
			update: {
				externalId: extId,
				color: div.color || "#1E3A5F",
				villageId: ID_DESA,
				externalActivityCount: activityCount,
			},
			create: {
				externalId: extId,
				name: name,
				color: div.color || "#1E3A5F",
				villageId: ID_DESA,
				externalActivityCount: activityCount,
			},
		});
	}
	logger.info(`Synced ${divisions.length} divisions`);
}

/**
 * 2. Sync Activities
 */
async function syncLatestProjects() {
	logger.info("Syncing Activities...");
	const { data, error } = await nocExternalClient.GET("/api/noc/latest-projects", {
		params: { query: { idDesa: ID_DESA, limit: "50" } },
	});

	if (error || !data) {
		logger.error({ error }, "Failed to fetch projects from NOC");
		throw new Error("Failed to fetch projects from NOC");
	}

	// biome-ignore lint/suspicious/noExplicitAny: External API response
	const resData = (data as any).data;
	const projects = Array.isArray(resData) ? resData : (resData?.projects || []);

	if (!Array.isArray(projects)) {
		logger.warn({ data }, "Projects data from NOC is not an array");
		return;
	}

	for (const proj of projects) {
		const extId = proj.id || proj.externalId || `proj-${proj.title.toLowerCase().replace(/\s+/g, "-")}`;
		
		// Temukan divisi lokal berdasarkan nama atau externalId
		const divisionName = proj.divisionName || proj.group;
		const division = await prisma.division.findFirst({
			where: { name: divisionName },
		});

		if (!division) continue;

		// Map status safely to Prisma Enum
		let mappedStatus: any = "BERJALAN";
		const rawStatus = proj.status?.toString().toUpperCase();
		
		if (rawStatus === "2" || rawStatus === "COMPLETED" || rawStatus === "SELESAI") {
			mappedStatus = "SELESAI";
		} else if (rawStatus === "1" || rawStatus === "ONPROGRESS" || rawStatus === "BERJALAN") {
			mappedStatus = "BERJALAN";
		}

		await prisma.activity.upsert({
			where: { externalId: extId },
			update: {
				title: proj.title,
				status: mappedStatus,
				progress: proj.progress || (mappedStatus === "SELESAI" ? 100 : 50),
				divisionId: division.id,
				villageId: ID_DESA,
			},
			create: {
				externalId: extId,
				title: proj.title,
				status: mappedStatus,
				progress: proj.progress || (mappedStatus === "SELESAI" ? 100 : 50),
				divisionId: division.id,
				villageId: ID_DESA,
			},
		});
	}
	logger.info(`Synced ${projects.length} activities`);
}

/**
 * 3. Sync Events
 */
async function syncUpcomingEvents() {
	logger.info("Syncing Events...");
	const systemUserId = await getSystemUserId();
	const { data, error } = await nocExternalClient.GET("/api/noc/upcoming-events", {
		params: { query: { idDesa: ID_DESA, limit: "50" } },
	});

	if (error || !data) {
		logger.error({ error }, "Failed to fetch events from NOC");
		throw new Error("Failed to fetch events from NOC");
	}

	// biome-ignore lint/suspicious/noExplicitAny: External API response
	const resData = (data as any).data;
	let events: any[] = [];
	if (Array.isArray(resData)) {
		events = resData;
	} else if (resData?.today || resData?.upcoming) {
		events = [...(resData.today || []), ...(resData.upcoming || [])];
	}

	for (const event of events) {
		const extId = event.id || event.externalId || `event-${event.title.toLowerCase().replace(/\s+/g, "-")}`;
		
		// Map event type safely to Prisma Enum
		let mappedType: any = "KEGIATAN";
		const rawType = event.eventType?.toString().toUpperCase();
		const validTypes = ["RAPAT", "KEGIATAN", "UPACARA", "SOSIAL", "BUDAYA", "LAINNYA"];
		
		if (rawType === "MEETING") {
			mappedType = "RAPAT";
		} else if (validTypes.includes(rawType)) {
			mappedType = rawType;
		}

		await prisma.event.upsert({
			where: { externalId: extId },
			update: {
				title: event.title,
				startDate: new Date(event.startDate || event.date),
				location: event.location || "N/A",
				eventType: mappedType,
				villageId: ID_DESA,
			},
			create: {
				externalId: extId,
				title: event.title,
				startDate: new Date(event.startDate || event.date),
				location: event.location || "N/A",
				eventType: mappedType,
				createdBy: systemUserId,
				villageId: ID_DESA,
			},
		});
	}
	logger.info(`Synced ${events.length} events`);
}

/**
 * 4. Sync Discussions
 */
async function syncLatestDiscussion() {
	logger.info("Syncing Discussions...");
	const systemUserId = await getSystemUserId();
	const { data, error } = await nocExternalClient.GET("/api/noc/latest-discussion", {
		params: { query: { idDesa: ID_DESA, limit: "50" } },
	});

	if (error || !data) {
		logger.error({ error }, "Failed to fetch discussions from NOC");
		throw new Error("Failed to fetch discussions from NOC");
	}

	// biome-ignore lint/suspicious/noExplicitAny: External API response
	const resData = (data as any).data;
	const discussions = Array.isArray(resData) ? resData : (resData?.discussions || resData?.data || []);

	if (!Array.isArray(discussions)) {
		logger.warn({ data }, "Discussions data from NOC is not an array");
		return;
	}

	for (const disc of discussions) {
		const division = await prisma.division.findFirst({
			where: { name: disc.divisionName || disc.group },
		});

		await prisma.discussion.upsert({
			where: { externalId: disc.id },
			update: {
				message: disc.message || disc.desc || disc.title,
				divisionId: division?.id,
				villageId: ID_DESA,
			},
			create: {
				externalId: disc.id,
				message: disc.message || disc.desc || disc.title,
				senderId: systemUserId,
				divisionId: division?.id,
				villageId: ID_DESA,
			},
		});
	}
	logger.info(`Synced ${discussions.length} discussions`);
}

/**
 * 5. Sync Document Stats (New)
 */
async function syncDocumentStats() {
	logger.info("Syncing Document Stats...");
	const { data, error } = await nocExternalClient.GET("/api/noc/diagram-jumlah-document", {
		params: { query: { idDesa: ID_DESA } },
	});

	if (error || !data) {
		logger.error({ error }, "Failed to fetch document stats from NOC");
		throw new Error("Failed to fetch document stats from NOC");
	}

	// biome-ignore lint/suspicious/noExplicitAny: External API response
	const resData = (data as any).data;
	if (!Array.isArray(resData)) {
		logger.warn({ data }, "Document stats data from NOC is not an array");
		return;
	}

	for (const stat of resData) {
		await prisma.documentStat.upsert({
			where: {
				villageId_label: {
					villageId: ID_DESA,
					label: stat.label,
				},
			},
			update: {
				value: stat.value,
				color: stat.color,
			},
			create: {
				villageId: ID_DESA,
				label: stat.label,
				value: stat.value,
				color: stat.color,
			},
		});
	}
	logger.info(`Synced ${resData.length} document stats`);
}

/**
 * 6. Update lastSyncedAt timestamp
 */
async function syncLastTimestamp() {
	logger.info("Updating sync timestamp...");
	await prisma.division.updateMany({
		where: { villageId: ID_DESA },
		data: { lastSyncedAt: new Date() },
	});
}

/**
 * Main Sync Function
 */
async function main() {
	try {
		logger.info("Starting NOC Data Synchronization...");
		
		await syncActiveDivisions();
		await syncLatestProjects();
		await syncUpcomingEvents();
		await syncLatestDiscussion();
		await syncDocumentStats();
		await syncLastTimestamp();
		
		logger.info("NOC Data Synchronization Completed Successfully");
	} catch (err) {
		logger.error({ err }, "Fatal error during NOC synchronization");
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
