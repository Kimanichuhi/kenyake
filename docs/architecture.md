# SafariSync Architecture

## High level
SafariSync is a React single page application backed by Supabase and AI edge functions.

## Frontend
- React Router controls navigation.
- Pages live under src/pages and share UI components in src/components.
- React Query is used for data fetching where needed.
- Leaflet renders interactive maps for wildlife and nearby experiences.

## Supabase backend
- Auth handles sign-up, sign-in, and session persistence.
- Database stores profiles and domain data.
- Realtime feeds power live wildlife sightings.

## Edge functions
- trip-assistant: streaming AI responses for the Trip Planner.
- nearby-discover: nearby discovery recommendations based on location.
- wildlife-intel: AI wildlife insights for multiple tabs.

## Offline architecture
- Offline maps cache tiles using the Cache API and track downloads in IndexedDB.
- Offline destination packs are stored in IndexedDB for local access.
- Offline sync queues writes and replays them on reconnect.

## PWA
- Vite PWA plugin builds the manifest and service worker.
- Workbox runtime caching keeps map tiles and fonts available.
- Install UX uses a banner and a dedicated /install page.

## Data flow examples
Trip Planner
1. User sends a message in /trip-planner.
2. Frontend calls the trip-assistant function.
3. Function streams an AI response back to the UI.

Wildlife Intel
1. User opens /wildlife-intel.
2. Live sightings are read from wildlife_sightings and subscribed in realtime.
3. AI tabs call wildlife-intel with a query type and display results.

Offline Packs
1. User downloads a pack in /offline-settings.
2. Frontend fetches published data from Supabase.
3. Pack is stored in IndexedDB and listed for offline use.
