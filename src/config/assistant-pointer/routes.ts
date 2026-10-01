import type { PointerRoute } from "./types";

/** Rute halaman yang boleh dibuka AI — sama dengan menu `sidebar.tsx` (dijaga test). */
export const POINTER_ROUTES: readonly PointerRoute[] = [
	{ route: "/", label: "Beranda", requiredFeature: "view-dashboard" },
	{
		route: "/kinerja-divisi",
		label: "Kinerja Divisi",
		requiredFeature: "view-kinerja-divisi",
	},
	{
		route: "/pengaduan-layanan-publik",
		label: "Pengaduan & Layanan Publik",
		requiredFeature: "view-pengaduan",
	},
	{
		route: "/jenna-analytic",
		label: "Jenna Analytic",
		requiredFeature: "view-jenna-analytic",
	},
	{
		route: "/demografi-pekerjaan",
		label: "Demografi & Pekerjaan",
		requiredFeature: "view-demografi",
	},
	{
		route: "/keuangan-anggaran",
		label: "Keuangan & Anggaran",
		requiredFeature: "view-keuangan",
	},
	{ route: "/bumdes", label: "BUMDes", requiredFeature: "view-bumdes" },
	{ route: "/sosial", label: "Sosial", requiredFeature: "view-sosial" },
	{ route: "/keamanan", label: "Keamanan", requiredFeature: "view-keamanan" },
];
