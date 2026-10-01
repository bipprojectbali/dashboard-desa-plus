import { prisma } from "./db";
import logger from "./logger";

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
	{ key: "use-ai-assistant", label: "AI Assistant" },
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

export const DEFAULT_PERMISSIONS: Record<AppRole, FeatureKey[]> = {
	admin: [...VIEW_FEATURES, "sync-noc", "use-ai-assistant"],
	user: [...VIEW_FEATURES, "use-ai-assistant"],
};

/**
 * Daftar fitur yang diizinkan untuk role: admin selalu semua fitur; role lain
 * memakai baris RolePermission per fitur, dan fitur tanpa baris jatuh ke
 * DEFAULT_PERMISSIONS (role di luar ROLES, mis. "moderator", memakai default
 * "user"). Per fitur, bukan per role — supaya fitur baru tetap aktif di DB
 * yang sudah punya baris untuk fitur lama.
 */
export function resolveAllowedFeatures(
	role: string | null | undefined,
	records: ReadonlyArray<{ feature: string; allowed: boolean }>,
): FeatureKey[] {
	if (role === "admin") return FEATURES.map((f) => f.key);

	const defaults =
		DEFAULT_PERMISSIONS[role as AppRole] ?? DEFAULT_PERMISSIONS.user;
	const fromDb = new Map(records.map((r) => [r.feature, r.allowed]));

	return FEATURES.map((f) => f.key).filter(
		(key) => fromDb.get(key) ?? defaults.includes(key),
	);
}

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
	} catch (err) {
		logger.warn(
			{ err, role, feature },
			"[PERMISSION] Failed to read permission, denying",
		);
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
