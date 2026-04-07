# Summary: Integrate Jenna MCP External API for Weekly Service Stat

## 📅 Date
April 7, 2026

## 🎯 Objective
Integrate external Jenna MCP API (`/api/noc/surat-perminggu`) to display weekly service letter count in the dashboard stat card.

## ✅ What Was Done

### 1. Created Jenna MCP External API Client (`src/utils/jenna-mcp-client.ts`)
**Purpose:** 
- Centralized client for accessing Jenna MCP external API
- Handles authentication with Bearer token
- Provides type-safe data fetching

**Features:**
- **Base URL:** `https://cld-dkr-prod-jenna-mcp.wibudev.com`
- **Authentication:** Bearer token in Authorization header
- **Generic fetch function:** `fetchJennaMCP<T>(endpoint, options?)`
- **Specific function:** `getWeeklyServiceCount()` for weekly service letters
- **Flexible response parsing:** Handles multiple response structures (`data.count`, `data.total`, `count`, etc.)
- **Error handling:** Console logging and fallback to 0 on error

**API Endpoint:**
```
GET /api/noc/surat-perminggu
Headers: { Authorization: "Bearer eyJhbGc..." }
```

---

### 2. Updated Dashboard Content (`src/components/dashboard-content.tsx`)
**Changes:**
- Imported `getWeeklyServiceCount` from new Jenna MCP client
- Removed internal API call for weekly service (`/api/complaint/service-weekly`)
- Added external API fetch for weekly service count
- Updated stats fetching logic to use external data

**Before:**
```typescript
const weeklyServiceRes = await apiClient.GET("/api/complaint/service-weekly");
weeklyService: weeklyServiceRes.data?.data?.count || 0
```

**After:**
```typescript
const weeklyServiceCount = await getWeeklyServiceCount();
weeklyService: weeklyServiceCount
```

---

### 3. StatCard Component (`src/components/dashboard/stat-card.tsx`)
**Status:** ✅ No changes needed

The StatCard remains a presentational component - it just displays the data passed to it via props. This is the correct architecture:
- **StatCard:** Presentational (receives `value` prop)
- **DashboardContent:** Data fetching (calls external API)
- **JennaMCPClient:** External API communication

---

## 📊 Files Changed

| File | Changes | Lines |
|------|---------|-------|
| `src/utils/jenna-mcp-client.ts` | New file | +69 |
| `src/components/dashboard-content.tsx` | Modified | +8 / -8 |

**Total:** 2 files changed, +77 insertions, -8 deletions

---

## 🔐 Security Notes

**⚠️ IMPORTANT:** The Bearer token is currently hardcoded in the client file. For production:

1. **Move token to environment variable:**
   ```typescript
   const JENNA_MCP_API_KEY = import.meta.env.VITE_JENNA_MCP_API_KEY;
   ```

2. **Add to `.env`:**
   ```
   VITE_JENNA_MCP_API_KEY=Bearer eyJhbGci...
   ```

3. **Add to `.env.example`:**
   ```
   VITE_JENNA_MCP_API_KEY=your-jenna-mcp-bearer-token
   ```

4. **Add to `.gitignore`** if not already:
   ```
   .env
   .env.local
   ```

---

## 🧪 Testing Recommendations

### Manual Testing:
- [ ] Dashboard loads without errors
- [ ] "Surat Minggu Ini" stat shows correct count from external API
- [ ] Stat updates on page refresh
- [ ] Fallback to 0 if external API fails
- [ ] Console shows error if API fails (check Network tab)

### API Testing:
```bash
# Test external API
curl -X GET "https://cld-dkr-prod-jenna-mcp.wibudev.com/api/noc/surat-perminggu" \
  -H "Authorization: Bearer eyJhbGci..."
```

### Expected Response Structure:
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

Or variations:
```json
{
  "count": 5
}
```

---

## ⚠️ Notes

- **No Breaking Changes:** Other stat cards still use internal APIs
- **StatCard Unchanged:** Remains presentational component
- **Error Handling:** Falls back to 0 if external API fails
- **Performance:** External API called in parallel with other stats
- **CORS:** External API must allow requests from dashboard domain

---

## 🚀 Future Enhancements

1. **Environment Variables:** Move Bearer token to env vars
2. **Retry Logic:** Add retry on API failure
3. **Caching:** Cache response to reduce API calls
4. **Loading State:** Show loading indicator specifically for this stat
5. **Error UI:** Show error message instead of 0 on failure
6. **Other Stats:** Consider using external API for other stat cards

---

## 📝 Related Commits

- **Commit:** TBD
- **Branch:** `tasks/dashboard/integrate-jenna-mcp-api-weekly-service/20260407-1800`
- **Message:** feat(dashboard): integrate Jenna MCP external API for weekly service stat

---

**Status:** ✅ Completed  
**Next:** Test external API integration and move Bearer token to env vars  
**Last Updated:** April 7, 2026
