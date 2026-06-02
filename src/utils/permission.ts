import { prisma } from "./db";

export type AppRole = "admin" | "user";

export const FEATURES = [
	{ key: "view-dashboard", label: "Beranda / Dashboard" },
	{ key: "view-kinerja-divisi", label: "Kinerja Divisi" },
	{ key: "view-pengaduan", label: "Pengaduan & Layanan Publik" },
	{ key: "view-jenna-analytic", label: "Jenna Analytic" },
	{ key: "view-demografi", label: "Demografi & Pekerjaan" },
	{ key: "view-keuangan", label: "Keuangan & Anggaran" },
	{ key: "view-bumdes", label: "BUMDes" },
	{ key: "view-sosial", label: "Sosial" },
	{ key: "view-keamanan", label: "Keamanan" },
	{ key: "sync-noc", label: "Sinkronisasi Data (NOC)" },
] as const;

export type FeatureKey = (typeof FEATURES)[number]["key"];

export const ROLES: AppRole[] = ["admin", "user"];

const VIEW_FEATURES: FeatureKey[] = [
	"view-dashboard",
	"view-kinerja-divisi",
	"view-pengaduan",
	"view-jenna-analytic",
	"view-demografi",
	"view-keuangan",
	"view-bumdes",
	"view-sosial",
	"view-keamanan",
];

const DEFAULT_PERMISSIONS: Record<AppRole, FeatureKey[]> = {
	admin: [...VIEW_FEATURES, "sync-noc"],
	user: VIEW_FEATURES,
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
