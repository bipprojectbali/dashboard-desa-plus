import { prisma } from "./db";

export type AppRole = "admin" | "petugas" | "viewer";

export const FEATURES = [
	{ key: "view-dashboard", label: "Lihat Dashboard" },
	{ key: "view-demografi", label: "Lihat Demografi" },
	{ key: "crud-division", label: "CRUD Divisi & Kegiatan" },
	{ key: "crud-complaint", label: "CRUD Pengaduan" },
	{ key: "crud-umkm", label: "CRUD UMKM" },
	{ key: "crud-resident", label: "CRUD Data Penduduk" },
	{ key: "crud-event", label: "CRUD Event/Agenda" },
	{ key: "export-pdf", label: "Export PDF" },
	{ key: "sync-noc", label: "Sinkronisasi NOC" },
	{ key: "view-keamanan", label: "Laporan Keamanan" },
	{ key: "manage-budget", label: "Kelola Anggaran APBDes" },
] as const;

export type FeatureKey = (typeof FEATURES)[number]["key"];

export const ROLES: AppRole[] = ["admin", "petugas", "viewer"];

const DEFAULT_PERMISSIONS: Record<AppRole, FeatureKey[]> = {
	admin: FEATURES.map((f) => f.key),
	petugas: [
		"view-dashboard",
		"view-demografi",
		"crud-division",
		"crud-complaint",
		"crud-umkm",
		"crud-resident",
		"crud-event",
		"export-pdf",
		"view-keamanan",
	],
	viewer: ["view-dashboard", "view-demografi", "view-keamanan"],
};

export async function checkPermission(
	role: string | null | undefined,
	feature: FeatureKey,
): Promise<boolean> {
	if (!role) return false;
	if (role === "admin") return true;

	try {
		const record = await prisma.rolePermission.findUnique({
			where: { role_feature: { role, feature } },
			select: { allowed: true },
		});

		if (record !== null) return record.allowed;

		// Fall back to defaults if no DB record exists yet
		const defaults = DEFAULT_PERMISSIONS[role as AppRole];
		return defaults ? defaults.includes(feature) : false;
	} catch {
		return false;
	}
}

export async function seedDefaultPermissions(): Promise<void> {
	const ops = ROLES.flatMap((role) =>
		FEATURES.map((f) =>
			prisma.rolePermission.upsert({
				where: { role_feature: { role, feature: f.key } },
				create: {
					role,
					feature: f.key,
					allowed: DEFAULT_PERMISSIONS[role].includes(f.key),
				},
				update: {},
			}),
		),
	);
	await prisma.$transaction(ops);
}
