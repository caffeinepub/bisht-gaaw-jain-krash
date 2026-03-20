# बिष्ट गाँव जैन क्रांश

## Current State
- Photo/video upload fails with "Expected v3 response body" error in StorageClient.ts `getCertificate()` method
- addProduct and addPerson mutations silently fail with generic error toast
- StorageClient.getCertificate() only handles v3 IC responses, throws error for v2 responses
- Mutation error handlers show generic Hindi messages with no retry capability

## Requested Changes (Diff)

### Add
- v2 IC response fallback in StorageClient.getCertificate() using @dfinity/agent polling approach
- Retry logic for addProduct and addPerson mutations (3 retries with delay)
- Better error messages showing exact failure reason
- Actor readiness check before mutations with "Page refresh karein" prompt

### Modify
- StorageClient.ts: getCertificate() to handle both v2 and v3 IC response bodies
- addProductMutation onError: show retry button or auto-retry
- addMutation (people) onError: more specific error message
- Photo/video upload: reduce initial image size from 1920px to 1200px max dimension to prevent large uploads

### Remove
- Nothing removed

## Implementation Plan
1. Fix StorageClient.ts getCertificate() to handle v2 responses:
   - Check if result has requestId (v2 case)
   - For v2, use @dfinity/agent or @icp-sdk/core polling to read state and get certificate
   - Alternatively, decode the Candid reply if it contains the certificate directly
2. Add retry logic in addProduct mutation (3 attempts, 1.5s delay)
3. Add retry logic in addPerson/addMutation (3 attempts, 1.5s delay)
4. Add actor null check with user-friendly Hindi message "पेज refresh करें"
5. Keep all other features intact
