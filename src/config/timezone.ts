/**
 * Zona waktu aplikasi — tetap (fixed), bukan preferensi per-user.
 *
 * Desa Darmasaba berada di Bali (WITA / GMT+8). Timestamp data (sinkronisasi,
 * kegiatan, audit log) selalu disimpan UTC di DB dan ditampilkan dengan zona
 * desa ini, supaya waktu kejadian konsisten untuk semua pengguna tanpa
 * bergantung pada lokasi/browser yang mengakses dashboard.
 */
export const APP_TIMEZONE = "Asia/Makassar";

/** Label singkat zona waktu untuk ditampilkan di UI. */
export const APP_TIMEZONE_LABEL = "WITA";

/** Offset zona waktu desa dalam menit (WITA = GMT+8 = 480 menit). */
export const APP_TIMEZONE_OFFSET_MINUTES = 480;
