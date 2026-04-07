# Summary: Remove Local DB Fallback for APBDes

## 📋 Change
Removed the fallback to local Prisma database when external API fails. Now the endpoint **only** fetches data from the external Desa website API (`/api/landingpage/apbdes/{id}`).

## ✅ What Changed

**File**: `src/api/noc.ts`

### Before:
```typescript
try {
    // Try external API
    const { data: extData, error } = await desaExternalClient.GET(...);
    if (!error && extData) {
        return { success: true, message: "...", data: chartData };
    }
} catch (err) {
    console.error("Failed to fetch APBDes from external Desa API:", err);
}

// Fallback to local DB if external fails
const data = await prisma.budget.findMany({
    where: { fiscalYear: 2025 },
    orderBy: { category: "asc" },
});

return {
    success: true,
    message: "Berhasil mendapatkan data APBDes dari database lokal",
    data: data.map((d) => ({
        category: d.category,
        anggaran: d.amount,
        realisasi: 0,
        percentage: d.percentage,
        color: d.color,
    })),
};
```

### After:
```typescript
try {
    // Try external API
    const { data: extData, error } = await desaExternalClient.GET(...);
    if (!error && extData) {
        return { success: true, message: "...", data: chartData };
    }
} catch (err) {
    console.error("Failed to fetch APBDes from external Desa API:", err);
}

// Return empty array if external API fails
return {
    success: false,
    message: "Gagal mengambil data APBDes dari website desa",
    data: [],
};
```

## 🎯 Benefits

1. **Single Source of Truth**: Data only comes from the official Desa website API
2. **No Stale Data**: Won't show outdated local database data
3. **Clear Error Handling**: Returns `success: false` when external API fails
4. **Simpler Code**: Removed unnecessary fallback logic

## 📊 Behavior

### Success Case:
```typescript
// External API returns data
{
  success: true,
  message: "Berhasil mendapatkan data APBDes APBDes Tahun 2026 (2026)",
  data: [
    { category: "Pendapatan", anggaran: 200000000, realisasi: 70000000, percentage: 35, color: "#10B981" },
    { category: "Belanja", anggaran: 50000000, realisasi: 25000000, percentage: 50, color: "#3B82F6" },
    { category: "Pembiayaan", anggaran: 100000000, realisasi: 35000000, percentage: 35, color: "#F59E0B" }
  ]
}
```

### Failure Case:
```typescript
// External API fails or returns error
{
  success: false,
  message: "Gagal mengambil data APBDes dari website desa",
  data: []
}
```

## 🧪 Testing

1. **External API Available**:
   - Chart displays realisasi data correctly
   - Shows 3 categories with progress bars

2. **External API Down**:
   - Chart shows "Tidak ada data APBDes"
   - No fallback to local database
   - Clear error message in console

## ✅ Verification

- [x] Removed local DB fallback code
- [x] Returns empty array on failure
- [x] Returns `success: false` on failure
- [x] No TypeScript errors
- [x] API types regenerated
- [x] Console logging for debugging

## 🎉 Result

The APBDes endpoint now **only** fetches data from the external Desa website API, ensuring data accuracy and eliminating dependency on local database.
