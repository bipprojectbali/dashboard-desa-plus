// Chart & status color tokens — versi soft (chroma diturunkan) agar tidak
// "ngejreng" di TV Vivid mode maupun layar terang. Nilai tunggal per-hue
// (bukan light/dark) karena dikonsumsi di data-layer (SVG fill / recharts /
// data-transform) yang butuh nilai JS aktual — CSS var tidak bisa dipakai di
// sana. Selaras dengan token semantik di `palette.ts` / `--app-*`.
//
// Pengganti hex Tailwind-500 saturated lama:
//   #EF4444 → red · #3B82F6 → blue · #22C55E/#10B981 → green
//   #F59E0B/#FACC15 → amber · #F97316 → orange · #A78BFA/#8B5CF6 → violet
//   #A855F7 → grape · #EC4899 → pink · #38BDF8 → cyan

export const CHART = {
	red: "#D25E5E", // danger / merah — antara light #D14D4D & dark #D46A6A
	blue: "#5A8DD6", // primary / biru
	green: "#57A773", // success / hijau (juga pengganti emerald #10B981)
	amber: "#DFA94E", // warning / kuning-amber
	orange: "#D98B5A", // oranye soft (Konghucu, divisi Adat, apbdes)
	violet: "#9385D1", // violet / kategori
	grape: "#B07FD1", // ungu-magenta (Katolik) — senada violet, hue digeser
	pink: "#C77BA6", // pink soft (divisi Kesejahteraan Sosial)
	cyan: "#5C9DB8", // info / cyan sekunder
	gray: "#94A3B8", // netral / "lainnya"
} as const;

export type ChartColorKey = keyof typeof CHART;
