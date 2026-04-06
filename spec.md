# Bisht Gaaw Jain Krash

## Current State

App has a Motoko backend with Map-based storage for products, transport, news, people, services, quickServices. Maps are declared with `let Map.empty` which is NOT stable storage — data resets on canister upgrades/rebuilds. Frontend already has SheetDB integration for backup/sync but still primarily reads from backend.

User wants data entry (products, transport, news, people) to persist reliably WITHOUT depending on backend canister state.

## Requested Changes (Diff)

### Add
- SheetDB as primary data store for: उत्पाद (products), ग्रामीन यातायात (transport), खबरें (news), लोग (people)
- On page load, data is fetched directly from SheetDB (no backend needed for read)
- On add/edit/delete, data is saved directly to SheetDB (primary), backend call is optional/secondary
- localStorage fallback for offline/fast load

### Modify
- `useQuery` for products, transport, news, people: read from SheetDB first, not backend
- `addProductMutation`, `addTransportMutation`, `addNews`, `addPerson`: save to SheetDB first (await), then try backend (fire-and-forget)
- Delete/edit mutations: update SheetDB first, then backend
- Services and quickServices: keep localStorage + backend as before (already working)

### Remove
- Dependency on backend actor for products/transport/news/people reads
- Blocking on actor availability before showing/saving data

## Implementation Plan

1. Update SheetDB helper to support update by row id and get all without type filter
2. In App.tsx:
   - Products: `getProducts` query → read from SheetDB; add/edit/delete → SheetDB primary
   - Transport: same pattern
   - News: same pattern  
   - People: same pattern
3. Each item gets a stable `id` (timestamp string) stored in SheetDB
4. Data displays immediately from SheetDB on page load, no actor wait needed
5. Backend calls remain as secondary (fire-and-forget) for any that are already working
