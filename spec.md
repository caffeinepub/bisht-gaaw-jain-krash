# Bisht Gaaw Jain Krash

## Current State
App has backend persistence for: persons, products, transport, photos, videos, village info.
News, Services, Emergency Contacts, and Quick Services are stored in frontend localStorage — these are lost on page refresh/rebuild.

## Requested Changes (Diff)

### Add
- Backend types and CRUD for NewsItem (id, title, body, tag, date)
- Backend types and CRUD for ServiceContact (id, name, phone, timing, type: 'service'|'emergency')
- Backend types and CRUD for QuickService (id, icon, label, detail)

### Modify
- Frontend: Replace localStorage for news with backend addNews/updateNews/deleteNews/getNews calls
- Frontend: Replace localStorage for services/emergency with backend addServiceContact/updateServiceContact/deleteServiceContact/getServiceContacts
- Frontend: Replace in-memory quickServices state with backend addQuickService/updateQuickService/deleteQuickService/getQuickServices

### Remove
- All localStorage.setItem/getItem calls for bisht_services, bisht_emergency, bisht_news_count

## Implementation Plan
1. Add News, ServiceContact, QuickService types to Motoko backend
2. Add CRUD functions for each new type (open to all callers, no auth check for add/update)
3. Regenerate backend.d.ts bindings
4. Update frontend to load all data from backend on mount
5. Update all add/edit/delete handlers to call backend and refresh data
