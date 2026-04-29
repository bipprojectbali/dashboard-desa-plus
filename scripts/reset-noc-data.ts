import { prisma } from "../src/utils/db";
import logger from "../src/utils/logger";

async function resetNocData() {
	try {
		logger.info("Starting NOC Data Reset...");

		// Delete in order to respect relations
		// 1. Delete Activities (though Division cascade might handle it, let's be explicit)
		const deletedActivities = await prisma.activity.deleteMany({});
		logger.info(`Deleted ${deletedActivities.count} activities`);

		// 2. Delete Documents
		const deletedDocuments = await prisma.document.deleteMany({});
		logger.info(`Deleted ${deletedDocuments.count} documents`);

		// 3. Delete Discussions
		const deletedDiscussions = await prisma.discussion.deleteMany({});
		logger.info(`Deleted ${deletedDiscussions.count} discussions`);

		// 4. Delete Events
		const deletedEvents = await prisma.event.deleteMany({});
		logger.info(`Deleted ${deletedEvents.count} events`);

		// 5. Delete Divisions
		const deletedDivisions = await prisma.division.deleteMany({});
		logger.info(`Deleted ${deletedDivisions.count} divisions`);

		logger.info("NOC Data Reset Completed Successfully");
	} catch (err) {
		logger.error({ err }, "Error during NOC data reset");
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

resetNocData();
