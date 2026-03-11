# SafariSync Developer Guide

## Tech stack
- Vite + React + TypeScript
- React Router
- Tailwind CSS + shadcn/ui
- Supabase (auth, database, edge functions)
- Vite PWA plugin and Workbox caching
- Leaflet maps

## Quick start
1. Install dependencies: npm install
2. Configure environment variables
3. Run the dev server: npm run dev

## Environment variables
Create a local .env file with:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

Supabase Edge Functions require:
- LOVABLE_API_KEY (set in Supabase function env)

## Scripts
- npm run dev: start the dev server
- npm run build: production build
- npm run preview: preview production build
- npm run lint: lint
- npm run test: run tests once
- npm run test:watch: run tests in watch mode

## Project structure
- src/pages: route pages
- src/components: shared UI and feature components
- src/hooks: offline, sync, and utility hooks
- src/contexts: auth context
- src/integrations/supabase: supabase client and generated types
- public: PWA icons and static assets
- supabase/functions: edge functions
- supabase/migrations: database schema changes

## Routes
The main app routes are defined in src/App.tsx. Key routes include:
- /: home
- /destinations, /destinations/:id
- /experiences
- /wildlife
- /community, /community/:slug
- /guides
- /events
- /food
- /safety
- /impact
- /nomads
- /onboard
- /auth
- /profile
- /nearby
- /trip-planner
- /wildlife-intel
- /cultural-prep
- /guide-register
- /guide-dashboard
- /accommodation
- /marketplace
- /transport
- /domestic
- /heritage
- /offline-settings
- /community-dashboard
- /operator-dashboard
- /county-analytics
- /platform-admin
- /install

## Supabase integration
Auth
- src/contexts/AuthContext.tsx uses Supabase auth.
- Profiles are stored in the profiles table.

Data tables inferred from client usage
- wildlife_sightings
- experiences
- accommodations
- guides
- food_listings

Realtime
- Wildlife sightings subscribe to inserts on wildlife_sightings.

## Edge functions
Functions live in supabase/functions and are invoked through Supabase.
- trip-assistant: streaming chat completion for the AI trip planner.
- nearby-discover: AI discovery data near the user location.
- wildlife-intel: AI wildlife intelligence for multiple tabs.

## Offline and PWA
- Vite PWA plugin registers a service worker and app manifest.
- Workbox caches OSM tiles and Google Fonts.
- Offline maps use Cache API plus IDB metadata.
- Offline packs store content in IndexedDB.
- Offline sync queues actions in IndexedDB and replays when online.

## Testing
- Vitest is configured. Use npm run test.

## Deployment notes
- Build with npm run build.
- The PWA install prompt requires HTTPS and a valid manifest.
- Ensure Supabase env vars are configured in the deployment environment.
