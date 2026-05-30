import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export async function seedHealthRecords() {
	const adminId = "JFIZq6Jqzf3PBTrx1VjECSooCymgskPW";

	const residents = await prisma.resident.findMany({
		include: { banjar: true },
	});

	if (residents.length === 0) {
		console.log("  ⚠️  No residents found, skipping health records seed");
		return;
	}

	const typeNotes: [string, string[]][] = [
		[
			"Pemeriksaan",
			[
				"Pemeriksaan rutin bulanan",
				"Tekanan darah normal",
				"Berat badan ideal",
				"Kondisi umum baik",
			],
		],
		[
			"Imunisasi",
			[
				"Imunisasi DPT lengkap",
				"Imunisasi campak",
				"Imunisasi BCG",
				"Imunisasi hepatitis B",
			],
		],
		[
			"Ibu Hamil",
			[
				"Kehamilan 8 minggu, kondisi baik",
				"Kehamilan 20 minggu, USG normal",
				"Kehamilan 32 minggu, perkembangan normal",
				"Pasca melahirkan, pemulihan baik",
			],
		],
	];

	const now = new Date();
	const records: {
		residentId: string;
		recordedBy: string;
		type: string;
		notes: string;
		createdAt: Date;
	}[] = [];

	for (const resident of residents) {
		for (let monthOffset = 0; monthOffset < 18; monthOffset++) {
			const date = new Date(now);
			date.setMonth(date.getMonth() - monthOffset);

			const [type, noteList] = typeNotes[monthOffset % 3] as [string, string[]];
			const notes = noteList[monthOffset % 4] as string;

			records.push({
				residentId: resident.id,
				recordedBy: adminId,
				type,
				notes,
				createdAt: date,
			});
		}
	}

	await prisma.healthRecord.createMany({ data: records, skipDuplicates: true });
	console.log(`  ✅ Seeded ${records.length} health records`);
}

if (import.meta.main) {
	seedHealthRecords()
		.catch(console.error)
		.finally(() => prisma.$disconnect());
}
