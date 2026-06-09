# Summary Perubahan — 9 Juni 2026

## Konteks
Integrasi data Pengaduan & Layanan Publik ke external API (`desa-platform-stg.wibudev.com`) menggunakan pola proxy yang sama dengan Jenna Analytics. Sebelumnya data diambil dari 5 endpoint internal (`/api/complaint/*`) yang membaca database lokal.

---

## File yang Diubah

### 1. `src/index.ts`
**Tambah proxy endpoint baru:**
```
GET /api/noc/pengaduan
```
- Proxy 1 fetch langsung ke `VITE_JENNA_API_URL/api/noc/pengaduan`
- Menggunakan Bearer token dari `VITE_JENNA_API_TOKEN`
- Pass-through response (tidak ada transformasi di backend)
- Pola identik dengan `/api/jenna/analytics` yang sudah ada

### 2. `src/components/pengaduan-layanan-publik.tsx`
Refactor total komponen — dari multi-source menjadi single API source.

#### Dead Code yang Dihapus
| Item | Alasan |
|---|---|
| Import `useAksesPrefs` | Tombol export sudah dihapus, tidak digunakan |
| Import `InnovationIdeaModal` | Modal tidak pernah bisa dibuka (tidak ada onClick) |
| Import `apiClient` | Tidak ada lagi local API calls |
| State `selectedIdea`, `ideaModalOpen` | Modal dead code |
| `handleExport()` function | Export button sudah dihapus/dikomentari |
| 5x `apiClient.GET()` calls | Diganti single fetch ke proxy |
| `localLoading` state | Tidak perlu, hanya 1 loading source |

#### Perubahan Data Source
| Sebelum | Sesudah |
|---|---|
| `apiClient.GET("/api/complaint/stats")` | `fetch("/api/noc/pengaduan")` → `json.stats` |
| `apiClient.GET("/api/complaint/trends")` | `fetch("/api/noc/pengaduan")` → `json.trends` |
| `apiClient.GET("/api/complaint/service-stats")` | `fetch("/api/noc/pengaduan")` → `json.surat_terbanyak` |
| `apiClient.GET("/api/complaint/recent")` | `fetch("/api/noc/pengaduan")` → `json.pengajuan_terbaru` |
| `apiClient.GET("/api/complaint/innovation-ideas")` | `fetch("/api/noc/pengaduan")` → `json.musrenbang` |

#### Field Mapping (sesuai shape API)
| Field Lama | Field API Baru |
|---|---|
| `stats.proses` | `stats.diproses` |
| `item.title` | `item.kategori` (+ `item.sub_kategori`) |
| `item.category` | dihapus |
| `item.createdAt` | `item.created_at` |
| `item.submitterName` | `item.nama_pengusul` |
| `item.title` (musrenbang) | `item.judul` |

#### Hardcoded String yang Diperbaiki
| Sebelum | Sesudah |
|---|---|
| `"Belum ada data surat."` | `t.pengaduanLayanan.tidakAdaDataPengaduan` |
| `"Musrenbang"` (judul hardcoded) | `t.pengaduanLayanan.ajuanIdeInovatif` |

#### Penambahan
- Hook `usePengaduanNoc()` — mengikuti pola `useJennaAnalytics()` dari `jenna-analytic.tsx`
- Komponen `EmptyState` — tampilan konsisten (icon `Inbox` + teks) untuk semua kondisi data kosong
- Type `PengaduanData` — sesuai exact shape dari external API

---

## Shape API Response (`/api/noc/pengaduan`)
```json
{
  "stats": { "total": 4, "baru": 4, "diproses": 0, "selesai": 0 },
  "trends": [{ "bulan": "2026-04", "count": 23 }],
  "surat_terbanyak": [{ "jenis": "sk-domisili", "count": 10 }],
  "pengajuan_terbaru": [{
    "id": "...", "kategori": "lainnya", "sub_kategori": null,
    "status": "baru", "created_at": "2026-06-02T..."
  }],
  "musrenbang": [{
    "id": "...", "judul": "...", "nama_pengusul": "...", "created_at": "..."
  }]
}
```
