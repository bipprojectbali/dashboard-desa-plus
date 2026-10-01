// `emailVerified` di project ini berarti "sudah diverifikasi admin" lewat
// /admin/users, bukan verifikasi email (tidak ada email verifikasi yang
// dikirim). User lama bisa bernilai `null` — diperlakukan sama dengan `false`.

/** Pesan 403 untuk user yang belum diverifikasi admin. */
export const UNVERIFIED_MESSAGE = "Akun menunggu verifikasi admin";

// Path di belakang apiMiddleware yang tetap boleh dipakai user belum
// terverifikasi. Halaman /profile sengaja terbuka untuk mereka dan ini
// satu-satunya API yang dipanggilnya. Login/logout/cek status sudah di luar
// middleware (/api/auth/*, /api/session).
const UNVERIFIED_ALLOWED_PATHS: ReadonlySet<string> = new Set([
	"/api/profile/update",
]);

/** True hanya bila admin sudah memverifikasi user (`emailVerified === true`). */
export function isVerified(
	user: { emailVerified?: boolean | null } | null | undefined,
): boolean {
	return user?.emailVerified === true;
}

/** True bila path boleh diakses user yang belum terverifikasi. */
export function isUnverifiedAllowed(pathname: string): boolean {
	const normalized =
		pathname.length > 1 && pathname.endsWith("/")
			? pathname.slice(0, -1)
			: pathname;
	return UNVERIFIED_ALLOWED_PATHS.has(normalized);
}
