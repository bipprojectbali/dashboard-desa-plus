import { prisma } from "../src/utils/db";

async function check() {
    console.log("--- Checking Division Data in DB ---");
    const divisions = await prisma.division.findMany({
        select: {
            name: true,
            externalActivityCount: true,
        }
    });
    console.table(divisions);

    console.log("\n--- Checking API Response for /api/division/ ---");
    // Mocking the mapping logic from src/api/division.ts
    const formatted = divisions.map(d => ({
        name: d.name,
        activityCount: d.externalActivityCount
    }));
    console.table(formatted);
}

check().catch(console.error).finally(() => prisma.$disconnect());
