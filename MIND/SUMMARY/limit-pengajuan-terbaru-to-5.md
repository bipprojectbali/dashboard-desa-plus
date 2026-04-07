# Summary: Limit Pengajuan Terbaru to 5 Items

## 📋 Problem
Bagian "Pengajuan Terbaru" di halaman Pengaduan & Layanan Publik menampilkan **10 items** yang terlalu banyak dan membuat tampilan penuh.

## ✅ Solution

### Changed Limit from 10 to 5
**File**: `src/api/complaint.ts`

**Before**:
```typescript
const recent = await prisma.complaint.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,  // ❌ Too many items
});
```

**After**:
```typescript
const recent = await prisma.complaint.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,   // ✅ Limited to 5 items
});
```

## 📊 Impact

### Before:
```
┌─────────────────────────────────────┐
│  Pengajuan Terbaru                  │
├─────────────────────────────────────┤
│  1. Pengajuan KTP - BARU           │
│  2. Pengajuan KK - DIPROSES        │
│  3. Pengajuan SKDU - SELESAI       │
│  4. Pengajuan Surat Domisili - BARU│
│  5. Pengajuan SKU - DIPROSES       │
│  6. Pengajuan SKTM - SELESAI       │
│  7. Pengajuan KTP - BARU           │
│  8. Pengajuan KK - DIPROSES        │
│  9. Pengajuan SKDU - SELESAI       │
│  10. Pengajuan Surat Domisili - BARU│
└─────────────────────────────────────┘
```

### After:
```
┌─────────────────────────────────────┐
│  Pengajuan Terbaru                  │
├─────────────────────────────────────┤
│  1. Pengajuan KTP - BARU           │
│  2. Pengajuan KK - DIPROSES        │
│  3. Pengajuan SKDU - SELESAI       │
│  4. Pengajuan Surat Domisili - BARU│
│  5. Pengajuan SKU - DIPROSES       │
└─────────────────────────────────────┘
```

## 🎯 Benefits

1. ✅ **Cleaner UI**: Less cluttered, easier to scan
2. ✅ **Better Performance**: Fewer DOM elements to render
3. ✅ **Consistent with Other Sections**: Matches the limit of "Ajuan Ide Inovatif" (also 5)
4. ✅ **Better UX**: Users can quickly see the most recent submissions

## 📝 Files Modified

1. **`src/api/complaint.ts`**
   - Changed `take: 10` to `take: 5` in `/recent` endpoint

## ✅ Verification

- [x] Limit changed from 10 to 5
- [x] No TypeScript errors
- [x] Consistent with other sections (innovation ideas also uses 5)
- [x] Endpoint still returns most recent items (orderBy: createdAt desc)

## 🎉 Result

The "Pengajuan Terbaru" section now displays only the **5 most recent complaints**, providing a cleaner and more focused user experience.
