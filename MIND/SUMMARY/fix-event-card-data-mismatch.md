# Summary: Fix Event Card Data Mismatch

## 🔍 Problem
`activity-list.tsx` dan `event-card.tsx` menampilkan data yang berbeda meskipun menggunakan endpoint API yang sama (`/api/noc/upcoming-events`).

## 📊 Root Cause Analysis

### API Endpoint Behavior
Endpoint `/api/noc/upcoming-events` mendukung parameter `filter`:

```typescript
if (filter === "today") {
    // Get events for TODAY only (00:00 - 23:59)
    where.startDate = { gte: startOfDay, lte: endOfDay };
} else {
    // Get UPCOMING events (from now onwards)
    where.startDate = { gte: now };
}
```

### Before Fix

**`activity-list.tsx`** (Kalender & Kegiatan Mendatang):
```typescript
// Fetches UPCOMING events (no filter)
const res = await apiClient.GET("/api/noc/upcoming-events", {
    params: { query: { idDesa: "desa1", limit: "10" } },
    // NO filter → gets events where startDate >= now
});
```
✅ **Correct**: Shows all future events

**`event-card.tsx`** (Acara Hari Ini):
```typescript
// PRESENTATIONAL component only
// Doesn't fetch data, relies on props
export function EventCard({ agendas = [] }: EventCardProps) {
    // Just displays what's passed via props
}
```
❌ **Problem**: 
- Tidak fetch data sendiri
- Bergantung parent component
- Jika parent tidak pass data, kosong

## ✅ Solution

### Updated `event-card.tsx`
Now fetches **today's events** automatically if not provided via props:

```typescript
export function EventCard({ agendas: propAgendas }: EventCardProps) {
    const [agendas, setAgendas] = useState<AgendaItem[]>(propAgendas || []);
    const [loading, setLoading] = useState(!propAgendas);

    useEffect(() => {
        // If agendas not provided via props, fetch from API
        if (!propAgendas || propAgendas.length === 0) {
            async function fetchTodayEvents() {
                try {
                    const res = await apiClient.GET("/api/noc/upcoming-events", {
                        params: { query: { idDesa: "desa1", filter: "today" } },
                        //                    ^^^^^^^^^^^^^^^^ KEY DIFFERENCE
                    });
                    if (res.data?.data) {
                        const todayEvents = res.data.data.map((e) => ({
                            time: new Date(e.startDate).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                            }),
                            event: e.title,
                        }));
                        setAgendas(todayEvents);
                    }
                } catch (error) {
                    console.error("Failed to fetch today's events from NOC", error);
                } finally {
                    setLoading(false);
                }
            }

            fetchTodayEvents();
        }
    }, [propAgendas]);
    
    // ... render with loading state
}
```

## 📊 Data Flow Comparison

### `activity-list.tsx` (Kalender & Kegiatan Mendatang)
```
API: /api/noc/upcoming-events?idDesa=desa1&limit=10
     ↓ (no filter → upcoming events)
Returns: All events from now onwards
     ↓
Display: List of future events with dates
```

### `event-card.tsx` (Acara Hari Ini)
```
API: /api/noc/upcoming-events?idDesa=desa1&filter=today
     ↓ (filter=today → today only)
Returns: Events happening today (00:00 - 23:59)
     ↓
Display: Today's events with times
```

## 🎯 Key Differences

| Aspect | `activity-list.tsx` | `event-card.tsx` |
|--------|---------------------|------------------|
| **Purpose** | Kalender & Kegiatan Mendatang | Acara Hari Ini |
| **Filter** | None (upcoming) | `filter: "today"` |
| **Time Range** | Now → Future | Today (00:00 - 23:59) |
| **Data Source** | Fetches from API | Fetches if props empty |
| **Display** | Date + Title | Time + Event |
| **Limit** | 10 events | Default (5) |

## 🧪 Testing

### Test `activity-list.tsx`:
1. Open dashboard
2. Check "Kalender & Kegiatan Mendatang" card
3. Should show **all upcoming events** from now onwards
4. Each event shows: Date (e.g., "4 April 2026") + Title

### Test `event-card.tsx`:
1. Open page with EventCard component
2. Should show **today's events only**
3. Each event shows: Time (e.g., "14:30") + Event name
4. If no events today: "Tidak ada acara hari ini"
5. Loading state shows spinner while fetching

## ✅ Benefits

### 1. **Clear Separation of Concerns**
- `activity-list.tsx`: Shows future events
- `event-card.tsx`: Shows today's events

### 2. **Self-Sufficient Components**
- Both can fetch their own data
- Both support props override
- Both handle loading states

### 3. **Better UX**
- Loading indicators
- Empty state messages
- Proper time formatting

### 4. **Flexible**
- Can still pass data via props
- Falls back to API fetch if needed
- Easy to customize filters

## 📝 Files Modified

1. **`src/components/kinerja-divisi/event-card.tsx`**
   - Added data fetching with `filter: "today"`
   - Added loading state
   - Added useEffect for auto-fetch
   - Maintains backward compatibility with props

## 🎉 Result

Both components now correctly display their intended data:
- ✅ **`activity-list.tsx`**: All upcoming events (future)
- ✅ **`event-card.tsx`**: Today's events only (today)
- ✅ No more data mismatch
- ✅ Clear separation of purpose
- ✅ Better user experience

The components are now working as expected with proper data separation! 🚀
