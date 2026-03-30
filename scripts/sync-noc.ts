import { prisma } from "../src/utils/db";
import { nocExternalClient } from "../src/utils/noc-external-client";
import logger from "../src/utils/logger";

const ID_DESA = "darmasaba";

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
				email: "system@darmasaba.id",
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
		return;
	}

	// biome-ignore lint/suspicious/noExplicitAny: External API response is untyped
	const divisions = (data as any).data;
	for (const div of divisions) {
		await prisma.division.upsert({
			where: { externalId: div.id },
			update: {
				name: div.name,
				color: div.color,
				villageId: ID_DESA,
			},
			create: {
				externalId: div.id,
				name: div.name,
				color: div.color,
				villageId: ID_DESA,
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
		return;
	}

	// biome-ignore lint/suspicious/noExplicitAny: External API response
	const projects = (data as any).data;
	for (const proj of projects) {
		// Temukan divisi lokal berdasarkan nama atau externalId (asumsi externalId divisi sinkron)
		// Karena kita sinkron divisi dulu, kita cari berdasarkan nama jika externalId belum pasti
		const division = await prisma.division.findFirst({
			where: { name: proj.divisionName },
		});

		if (!division) continue;

		await prisma.activity.upsert({
			where: { externalId: proj.id },
			update: {
				title: proj.title,
				status: proj.status as any,
				progress: proj.progress,
				divisionId: division.id,
				villageId: ID_DESA,
			},
			create: {
				externalId: proj.id,
				title: proj.title,
				status: proj.status as any,
				progress: proj.progress,
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
		return;
	}

	// biome-ignore lint/suspicious/noExplicitAny: External API response
	const events = (data as any).data;
	for (const event of events) {
		await prisma.event.upsert({
			where: { externalId: event.id },
			update: {
				title: event.title,
				startDate: new Date(event.startDate),
				location: event.location,
				eventType: event.eventType as any,
				villageId: ID_DESA,
			},
			create: {
				externalId: event.id,
				title: event.title,
				startDate: new Date(event.startDate),
				location: event.location,
				eventType: event.eventType as any,
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
		return;
	}

	// biome-ignore lint/suspicious/noExplicitAny: External API response
	const discussions = (data as any).data;
	for (const disc of discussions) {
		const division = await prisma.division.findFirst({
			where: { name: disc.divisionName },
		});

		await prisma.discussion.upsert({
			where: { externalId: disc.id },
			update: {
				message: disc.message,
				divisionId: division?.id,
				villageId: ID_DESA,
			},
			create: {
				externalId: disc.id,
				message: disc.message,
				senderId: systemUserId,
				divisionId: division?.id,
				villageId: ID_DESA,
			},
		});
	}
	logger.info(`Synced ${discussions.length} discussions`);
}

/**
 * 5. Update lastSyncedAt timestamp
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
