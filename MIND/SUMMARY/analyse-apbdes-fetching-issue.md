# Analysis: APBDes Data Fetching Issue

## 🔍 Problem
Gagal mengambil data realisasi APBDes dari `/api/landingpage/apbdes/{id}`

## 📊 Root Cause Analysis

### Issue 1: **Wrong Base URL**
**Problem**: Default URL masih mengarah ke production (`https://darmasaba.desa.id`) padahal seharusnya staging (`https://desa-darmasaba-stg.wibudev.com`)

**Location**: `src/utils/desa-external-client.ts`

**Before**:
```typescript
const externalBaseUrl = getEnv("DESA_API_URL", "https://darmasaba.desa.id");
```

**After**:
```typescript
const externalBaseUrl = getEnv(
    "DESA_API_URL",
    "https://desa-darmasaba-stg.wibudev.com",
);
```

### Issue 2: **Missing Environment Variable**
**Problem**: `.env` file tidak memiliki `DESA_API_URL`

**Solution**: Tambahkan ke `.env.example`:
```env
# Desa Website API (for APBDes data)
DESA_API_URL="https://desa-darmasaba-stg.wibudev.com"
```

## ✅ Data Structure Analysis

### External API Response (from `/api/landingpage/apbdes/cmmedyvex0004nv09ags7j0d6`)
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
        "totalRealisasi": 70000000,
        "selisih": 130000000,
        "persentase": 35
      },
      {
        "uraian": "Pembelanjaan Desa",
        "anggaran": 50000000,
        "tipe": "belanja",
        "totalRealisasi": 25000000,
        "selisih": 25000000,
        "persentase": 50
      },
      {
        "uraian": "Pembiayaan Desa",
        "anggaran": 100000000,
        "tipe": "pembiayaan",
        "totalRealisasi": 35000000,
        "selisih": 65000000,
        "persentase": 35
      }
    ]
  }
}
```

### Expected Transformation
```typescript
// Input: items array
[
  { anggaran: 200000000, totalRealisasi: 70000000, tipe: "pendapatan" },
  { anggaran: 50000000, totalRealisasi: 25000000, tipe: "belanja" },
  { anggaran: 100000000, totalRealisasi: 35000000, tipe: "pembiayaan" }
]

// Output: chart data
[
  { category: "Pendapatan", anggaran: 200000000, realisasi: 70000000, percentage: 35, color: "#10B981" },
  { category: "Belanja", anggaran: 50000000, realisasi: 25000000, percentage: 50, color: "#3B82F6" },
  { category: "Pembiayaan", anggaran: 100000000, realisasi: 35000000, percentage: 35, color: "#F59E0B" }
]
```

## 🔧 Fixes Applied

### 1. Updated Default Base URL
**File**: `src/utils/desa-external-client.ts`
- ✅ Changed from `https://darmasaba.desa.id` to `https://desa-darmasaba-stg.wibudev.com`
- ✅ Added console logging for debugging
- ✅ Added comments for production vs staging URLs

### 2. Added Environment Variable
**File**: `.env.example`
- ✅ Added `DESA_API_URL` configuration
- ✅ Documented purpose: "Desa Website API (for APBDes data)"

### 3. Transformation Logic (Already Correct)
**File**: `src/api/noc.ts`
- ✅ Groups items by `tipe` field
- ✅ Sums `anggaran` and `totalRealisasi` per type
- ✅ Calculates realization percentage
- ✅ Applies color mapping

## 🧪 Testing Steps

### 1. Set Environment Variable
```bash
# Copy .env.example to .env if not exists
cp .env.example .env

# Ensure DESA_API_URL is set
# DESA_API_URL="https://desa-darmasaba-stg.wibudev.com"
```

### 2. Restart Dev Server
```bash
bun run dev
```

### 3. Check Console Logs
Look for:
```
[Desa API Client] Base URL: https://desa-darmasaba-stg.wibudev.com
[APBDes] Fetching data for idDesa: cmmedyvex0004nv09ags7j0d6
[APBDes] Raw data from external API: { ... }
[APBDes] Processing items array: 3 items
[APBDes] Transformed chart data: [ ... ]
```

### 4. Verify Chart Display
- Title: "Berhasil mendapatkan Realisasi APBDes APBDes Tahun 2026 (2026)"
- 3 categories with progress bars
- Correct amounts in Rupiah

## 🚨 Potential Issues & Solutions

### Issue: CORS Error
**Symptom**: Browser blocks request due to CORS policy
**Solution**: Server-side fetch (Elysia) shouldn't have CORS issues. If problem persists, configure CORS on external API server.

### Issue: Network Timeout
**Symptom**: Request takes too long
**Solution**: Add timeout configuration to client:
```typescript
export const desaExternalClient = createClient<DesaPaths>({
    baseUrl: cleanBaseUrl,
    // Add timeout if needed
});
```

### Issue: API Returns 404
**Symptom**: Endpoint not found
**Solution**: Verify:
1. Base URL is correct: `https://desa-darmasaba-stg.wibudev.com`
2. Full URL: `https://desa-darmasaba-stg.wibudev.com/api/landingpage/apbdes/cmmedyvex0004nv09ags7j0d6`
3. Test in browser/Postman first

### Issue: Invalid Response Structure
**Symptom**: `items` array not found
**Solution**: Check console logs for actual response structure. Update transformation logic if structure changed.

## 📝 Files Modified

1. **`src/utils/desa-external-client.ts`**
   - Updated default URL to staging
   - Added console logging
   - Added documentation comments

2. **`.env.example`**
   - Added `DESA_API_URL` environment variable

## ✅ Verification Checklist

- [x] Default URL updated to staging
- [x] Environment variable added to .env.example
- [x] Console logging added for debugging
- [x] Transformation logic verified
- [x] No TypeScript errors
- [ ] Test with actual staging API
- [ ] Verify chart displays correctly

## 🎯 Next Steps

1. **Update `.env` file** with `DESA_API_URL`
2. **Restart dev server** to pick up new env var
3. **Test the endpoint** in browser console
4. **Verify chart displays** with real data
5. **Monitor logs** for any transformation issues

## 📞 If Still Failing

If the issue persists after these fixes:

1. **Test API directly**:
   ```bash
   curl https://desa-darmasaba-stg.wibudev.com/api/landingpage/apbdes/cmmedyvex0004nv09ags7j0d6
   ```

2. **Check server logs** for `[APBDes]` prefixed messages

3. **Verify network tab** in browser dev tools

4. **Check if API requires authentication** (API keys, tokens, etc.)

5. **Verify SSL certificates** for staging environment
