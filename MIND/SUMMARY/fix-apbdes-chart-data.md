# Summary: Fix APBDes Chart Data Integration

## 📋 Problem
Grafik APBDes tidak menampilkan data yang benar karena struktur response dari API eksternal berbeda dari yang diharapkan.

### External API Response Structure
```json
{
  "success": true,
  "data": {
    "id": "cmmedyvex0004nv09ags7j0d6",
    "tahun": 2026,
    "name": "APBDes Tahun 2026",
    "items": [
      {
        "uraian": "Dana Desa",
        "anggaran": 200000000,
        "tipe": "pendapatan",
        "persentase": 35
      },
      {
        "uraian": "Pembelanjaan Desa",
        "anggaran": 50000000,
        "tipe": "belanja",
        "persentase": 50
      },
      {
        "uraian": "Pembiayaan Desa",
        "anggaran": 100000000,
        "tipe": "pembiayaan",
        "persentase": 35
      }
    ]
  }
}
```

### Expected Chart Format
```typescript
{
  category: string,    // "Pendapatan", "Belanja", "Pembiayaan"
  amount: number,      // Total anggaran per kategori
  percentage: number,  // Persentase dari total
  color: string        // Warna untuk chart
}
```

## ✅ Solutions Implemented

### 1. Updated API Endpoint Transformation Logic
**File**: `src/api/noc.ts`

**Changes**:
- ✅ Added detection for `items` array structure
- ✅ Group items by `tipe` field (pendapatan, belanja, pembiayaan)
- ✅ Sum total anggaran for each type
- ✅ Calculate percentage based on total of all types
- ✅ Apply proper color mapping for each type
- ✅ Add comprehensive logging for debugging
- ✅ Multiple fallback strategies for different response formats

**Transformation Logic**:
```typescript
// Group by tipe (pendapatan, belanja, pembiayaan)
const groupedByType: Record<string, { total: number; count: number }> = {};

for (const item of apbdesData.items) {
    const tipe = item.tipe?.toLowerCase() || "lainnya";
    const anggaran = item.anggaran || 0;

    if (!groupedByType[tipe]) {
        groupedByType[tipe] = { total: 0, count: 0 };
    }
    groupedByType[tipe].total += anggaran;
    groupedByType[tipe].count += 1;
}

// Calculate total for percentage
const totalAll = Object.values(groupedByType).reduce((sum, g) => sum + g.total, 0);

// Transform to chart format
const chartData = Object.entries(groupedByType).map(([tipe, stats]) => ({
    category: tipe.charAt(0).toUpperCase() + tipe.slice(1),
    amount: stats.total,
    percentage: totalAll > 0 ? (stats.total / totalAll) * 100 : 0,
    color: colorMap[tipe] || "#6B7280",
}));
```

**Color Mapping**:
- `pendapatan` → Green (#10B981)
- `belanja` → Blue (#3B82F6)
- `pembiayaan` → Amber (#F59E0B)
- `lainnya` → Gray (#6B7280)

### 2. Enhanced Chart Component UI
**File**: `src/components/dashboard/chart-apbdes.tsx`

**Changes**:
- ✅ Added `amount` field to display actual budget amounts
- ✅ Created `formatCurrency()` helper to format Rupiah
  - `Rp 200jt` for millions
  - `Rp 1.5M` for billions
  - `Rp 50rb` for thousands
- ✅ Dynamic title from API response message
- ✅ Display both percentage and amount in UI
- ✅ Better visual hierarchy with stacked text

**UI Improvements**:
```typescript
// Before: Only showed percentage
<Text>{item.value}%</Text>

// After: Shows both percentage and amount
<Stack gap={0} w={100} align="flex-end">
    <Text fw={600}>{item.value.toFixed(1)}%</Text>
    <Text size="xs">{formatCurrency(item.amount)}</Text>
</Stack>
```

### 3. Updated APBDes ID
**File**: `src/components/dashboard/chart-apbdes.tsx`

Changed from generic `desa1` to specific APBDes ID:
```typescript
params: { query: { idDesa: "cmmedyvex0004nv09ags7j0d6" } }
```

## 📊 Expected Output

### Console Logs
```
[APBDes] Raw data from external API: { success: true, data: { ... } }
[APBDes] Processing items array: 3 items
[APBDes] Transformed chart data: [
  { category: "Pendapatan", amount: 200000000, percentage: 57.14, color: "#10B981" },
  { category: "Belanja", amount: 50000000, percentage: 14.29, color: "#3B82F6" },
  { category: "Pembiayaan", amount: 100000000, percentage: 28.57, color: "#F59E0B" }
]
```

### Chart Display
```
┌─────────────────────────────────────────────────┐
│  APBDes Tahun 2026                              │
├─────────────────────────────────────────────────┤
│  Pendapatan  ████████████████████  57.1%  Rp 200jt  │
│  Belanja     ██████               14.3%  Rp 50jt   │
│  Pembiayaan  ██████████           28.6%  Rp 100jt  │
└─────────────────────────────────────────────────┘
```

## 🎯 Data Flow

```
External API: /api/landingpage/apbdes/cmmedyvex0004nv09ags7j0d6
    ↓
Returns: { success: true, data: { items: [...] } }
    ↓
API Endpoint: /api/noc/apbdes-data
    ↓
Transformation:
  1. Extract items array
  2. Group by tipe field
  3. Sum anggaran per type
  4. Calculate percentages
  5. Apply color mapping
    ↓
Returns: { success: true, data: [{ category, amount, percentage, color }] }
    ↓
Chart Component:
  1. Fetch data
  2. Map to chart format
  3. Display with bars
  4. Show percentage + amount
```

## 📝 Files Modified

1. **`src/api/noc.ts`**
   - Added items array detection and transformation
   - Group by tipe logic
   - Percentage calculation
   - Comprehensive logging
   - Multiple fallback strategies

2. **`src/components/dashboard/chart-apbdes.tsx`**
   - Added amount field to interface
   - Created formatCurrency helper
   - Dynamic title from API message
   - Enhanced UI to show both % and amount
   - Updated ID to cmmedyvex0004nv09ags7j0d6

## 🧪 Testing Steps

1. **Start dev server**: `bun run dev`
2. **Open dashboard**: `http://localhost:3000`
3. **Check console logs**:
   ```
   [APBDes] Raw data from external API: ...
   [APBDes] Processing items array: 3 items
   [APBDes] Transformed chart data: ...
   ```
4. **Verify chart displays**:
   - Title: "Berhasil mendapatkan data APBDes APBDes Tahun 2026 (2026)"
   - 3 bars: Pendapatan, Belanja, Pembiayaan
   - Each shows percentage and amount
5. **Check amounts are correct**:
   - Pendapatan: Rp 200jt (57.1%)
   - Belanja: Rp 50jt (14.3%)
   - Pembiayaan: Rp 100jt (28.6%)

## ✅ Verification Checklist

- [x] API endpoint correctly transforms items array
- [x] Groups by tipe field (pendapatan, belanja, pembiayaan)
- [x] Calculates correct percentages
- [x] Applies proper color mapping
- [x] Component displays both percentage and amount
- [x] Currency formatting works correctly
- [x] Dynamic title from API response
- [x] No TypeScript/linting errors
- [x] Comprehensive logging for debugging
- [x] Multiple fallback strategies

## 🎉 Result

The APBDes chart now correctly displays real data from the Desa website API:
- ✅ **Accurate Data**: Shows actual budget amounts from external API
- ✅ **Better UX**: Displays both percentages and Rupiah amounts
- ✅ **Dynamic Title**: Shows APBDes year and name
- ✅ **Proper Grouping**: Groups items by type (pendapatan, belanja, pembiayaan)
- ✅ **Color Coded**: Each type has distinct color
- ✅ **Debuggable**: Comprehensive console logs for troubleshooting

The integration is production-ready and follows best practices! 🚀
