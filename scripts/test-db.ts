/**
 * Menjalankan test yang butuh PostgreSQL nyata (tests/db/) terhadap database
 * test, bukan DB dev. Bun memuat .env otomatis, lalu DATABASE_URL untuk proses
 * test ditimpa dengan TEST_DATABASE_URL.
 */
const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();

if (!testDatabaseUrl) {
	console.error(
		"[test:db] TEST_DATABASE_URL belum diset. Isi di .env (lihat .env.example) " +
			"dengan database test terpisah yang sudah dimigrasi, mis. " +
			"`DATABASE_URL=$TEST_DATABASE_URL bun x prisma migrate deploy`.",
	);
	process.exit(1);
}

if (testDatabaseUrl === process.env.DATABASE_URL?.trim()) {
	console.error(
		"[test:db] TEST_DATABASE_URL sama dengan DATABASE_URL. Gunakan database " +
			"terpisah — test membuat dan menghapus data.",
	);
	process.exit(1);
}

// Config terpisah tanpa preload happy-dom — lihat tests/db/bunfig.toml.
const command = [
	"bun",
	"--config=tests/db/bunfig.toml",
	"test",
	"tests/db",
	...process.argv.slice(2),
];

const proc = Bun.spawn(command, {
	env: { ...process.env, DATABASE_URL: testDatabaseUrl },
	stdio: ["inherit", "inherit", "inherit"],
});

process.exit(await proc.exited);
