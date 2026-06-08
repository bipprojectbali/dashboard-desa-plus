# fix: format angka UMKM sesuai locale (ID/EN)

## Perubahan

Tiga komponen UMKM diupdate agar format angka/mata uang menyesuaikan bahasa aktif (`i18nStore.lang`).

### File yang diubah

| File | Fungsi |
|---|---|
| `src/components/umkm/summary-cards.tsx` | `formatValue` di `KpiCard` |
| `src/components/umkm/produk-unggulan.tsx` | `formatCurrency` di `ProdukUnggulan` |
| `src/components/umkm/sales-table.tsx` | `formatCurrency` di `SalesTable` |

### Format baru

| Range | Bahasa ID | Bahasa EN |
|---|---|---|
| ≥ 1.000 | `1,5rb` | `1.5K` |
| ≥ 1.000.000 | `1,8Jt` | `1.8M` |
| ≥ 1.000.000.000 | `1,2M` | `1.2B` |
| ≥ 1.000.000.000.000 | `1,5T` | `1.5T` |

### Masalah sebelumnya

Nilai jutaan (1,8 jt) tampil sebagai `M` di mode bahasa Indonesia, seharusnya `Jt`. Format tidak membedakan miliar (`M`/`B`) dan triliun (`T`) berdasarkan locale.

### Implementasi

- Import `useSnapshot` dari `valtio` dan `i18nStore` di masing-masing komponen
- Deteksi `lang === "id"` untuk menentukan suffix yang dipakai
- Triliun (`T`) sama di kedua bahasa
