# SafariSync Admin Dashboard - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SAFARIYNC ADMIN DASHBOARD                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              FRONTEND (React + TypeScript)               │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Admin Layout Component (Sidebar Navigation)       │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                        │                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         Page Components                           │  │  │
│  │  │                                                    │  │  │
│  │  │ • Dashboard.tsx    - Overview & Metrics          │  │  │
│  │  │ • Communities.tsx  - Communities CRUD            │  │  │
│  │  │ • CommunityDetail.tsx - Community + Content      │  │  │
│  │  │ • Experiences.tsx  - Experiences Management      │  │  │
│  │  │ • Bookings.tsx     - Booking Management          │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                        │                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │      React Query Hooks (useAdmin.ts)             │  │  │
│  │  │                                                    │  │  │
│  │  │ • Query Caching (5-min TTL)                      │  │  │
│  │  │ • Automatic Re-fetching                          │  │  │
│  │  │ • Error Handling & Retries                       │  │  │
│  │  │ • Mutation Management                            │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                        │                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │      API Client (services/api.ts)                │  │  │
│  │  │                                                    │  │  │
│  │  │ • Authenticated HTTP Requests                    │  │  │
│  │  │ • File Upload Handling                           │  │  │
│  │  │ • Error Transformation                           │  │  │
│  │  │ • Response Formatting                            │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│                            ↓ HTTP (REST)                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            BACKEND (Node.js/Express)                    │  │
│  │                                                          │  │
│  │  Admin Routes (backend/src/routes/admin.ts)            │  │
│  │  • GET /api/communities                                │  │
│  │  • POST /api/experiences                               │  │
│  │  • PATCH /api/bookings/:id/status                      │  │
│  │  • DELETE /api/guides/:id                              │  │
│  │  • And more...                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         SUPABASE (PostgreSQL + Auth)                    │  │
│  │                                                          │  │
│  │  Authentication Layer                                   │  │
│  │  • User login/signup                                   │  │
│  │  • JWT token generation                                │  │
│  │  • Session management                                  │  │
│  │                                                          │  │
│  │  Database Tables                                        │  │
│  │  • admin_users (role-based access)                     │  │
│  │  • communities                                          │  │
│  │  • community_content                                   │  │
│  │  • community_events                                    │  │
│  │  • experiences                                          │  │
│  │  • experience_bookings                                 │  │
│  │  • guides                                               │  │
│  │  • guide_bookings                                      │  │
│  │  • guide_reviews                                       │  │
│  │  • bookings (all types)                                │  │
│  │  • reviews                                              │  │
│  │  • admin_audit_logs                                    │  │
│  │                                                          │  │
│  │  Storage (S3-compatible)                               │  │
│  │  • community-media bucket                              │  │
│  │  • Experience images                                   │  │
│  │  • Guide photos                                        │  │
│  │  • Event covers                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Hierarchy

```
AdminLayout
├── Sidebar Navigation
│   ├── Dashboard Link
│   ├── Communities Link
│   ├── Experiences Link
│   ├── Guides Link
│   ├── Bookings Link
│   ├── Reviews Link
│   ├── Settings Link
│   └── Logout
├── Header
│   └── User Profile + Logout
└── Main Content (Page Router)
    ├── AdminDashboard
    │   ├── StatsGrid (metrics)
    │   ├── Card (pending approvals)
    │   ├── DataTable (recent activity)
    │   └── Quick Actions
    ├── CommunitiesPage
    │   └── DataTable (communities list)
    ├── CommunityDetailPage
    │   ├── FormGroup (basic info)
    │   ├── Hero Image Upload
    │   ├── TextArea (descriptions)
    │   └── Community Content Manager
    ├── ExperiencesPage
    │   ├── Filters (category, status, etc.)
    │   └── DataTable (experiences list)
    └── BookingsPage
        ├── Filters (type, status, date)
        ├── StatsGrid (metrics)
        └── DataTable (bookings list)
```

---

## 🔄 Data Flow

### Creating a Community

```
User Input in Form
        ↓
Component State (formData)
        ↓
Submit Click → handleSave()
        ↓
API Call (communityService.create)
        ↓
Backend Route (POST /api/communities)
        ↓
Database Insert (communities table)
        ↓
Return Created Community
        ↓
React Query Mutation (useCreateCommunity)
        ↓
Cache Invalidation
        ↓
Automatic Re-fetch (useQuery)
        ↓
UI Update (show new community)
```

### Fetching Bookings

```
Component Mounts (CommunitiesPage)
        ↓
useBookings Hook Called
        ↓
React Query Checks Cache
        ├─ Cache Valid? → Return Cached Data ✓
        └─ Cache Invalid? → Fetch from API
                    ↓
            API Call (GET /api/bookings)
                    ↓
            Backend Query Database
                    ↓
            Return Paginated Results
                    ↓
            Store in Cache (5-min TTL)
                    ↓
            Component Receives Data
                    ↓
            Render DataTable
```

---

## 🗄️ Database Schema (Simplified)

```
┌────────────────────┐
│   admin_users      │
├────────────────────┤
│ id (UUID)          │
│ user_id (FK)       │ → auth.users
│ role (ENUM)        │
│ permissions (JSON) │
│ is_active (BOOL)   │
│ created_at         │
└────────────────────┘

┌────────────────────┐
│  communities       │
├────────────────────┤
│ id (UUID)          │
│ name (TEXT)        │
│ county (TEXT)      │
│ hero_image (TEXT)  │
│ managed_by (FK)    │ → admin_users
│ is_published (BOOL)│
│ created_at         │
└────────────────────┘

┌────────────────────┐
│ experiences        │
├────────────────────┤
│ id (UUID)          │
│ title (TEXT)       │
│ category (TEXT)    │
│ price_amount (INT) │
│ is_published (BOOL)│
│ is_featured (BOOL) │
│ community_id (FK)  │
│ created_at         │
└────────────────────┘

┌────────────────────┐
│ bookings           │
├────────────────────┤
│ id (UUID)          │
│ user_id (FK)       │
│ booking_type (TXT) │
│ total_price (INT)  │
│ status (ENUM)      │
│ created_at         │
└────────────────────┘

┌────────────────────┐
│ admin_audit_logs   │
├────────────────────┤
│ id (UUID)          │
│ admin_id (FK)      │
│ action (TEXT)      │
│ table_name (TEXT)  │
│ old_values (JSON)  │
│ new_values (JSON)  │
│ created_at         │
└────────────────────┘
```

---

## 🔐 Authentication Flow

```
User Visits /admin
        ↓
Check Supabase Session
        ├─ No Session? → Redirect to /login
        └─ Session Exists? → Check Admin Status
                    ↓
            Query admin_users table
            WHERE user_id = current_user
                    ├─ Not Found? → Show "Unauthorized"
                    └─ Found? → Load Admin Dashboard
                                ├─ Check Role
                                ├─ Load Permissions
                                └─ Render Based on Role
```

---

## 📊 State Management

```
React Query Cache
├── Dashboard Metrics (5-min TTL)
│   └── Revalidates every 5 minutes
├── Communities List (5-min TTL)
│   └── Paginated by (page, limit)
├── Community Detail
│   └── Refetch on edit
├── Experiences List
│   └── Filtered by category, status, etc.
└── Bookings List
    └── Filtered by type, status, date

Component State (Local)
├── FormData
├── SelectedFilters
├── Page Number
└── SelectedRows
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────┐
│         GitHub / Version Control        │
└────────────────────┬────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼─────────┐      ┌────────▼────────┐
│  Frontend Build │      │ Backend Build   │
│  (npm run build)│      │ (npm run build)│
└───────┬─────────┘      └────────┬────────┘
        │                         │
        │                         │
┌───────▼──────────────┐  ┌───────▼──────────┐
│  Netlify / Vercel    │  │  Heroku / Railway
│  (dist/ folder)      │  │  (Node.js Server)
└───────┬──────────────┘  └──────┬──────────┘
        │                         │
        │      ┌──────────────────┘
        │      │
        ▼      ▼
┌────────────────────────────────────┐
│  Supabase (PostgreSQL + Auth)     │
│  ├── Database                      │
│  ├── Authentication                │
│  └── Storage                       │
└────────────────────────────────────┘
```

---

## 📱 Request/Response Flow

### Example: Create Community

```
REQUEST:
POST /api/communities
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "name": "Maasai Mara Community",
  "county": "Narok",
  "description": "...",
  "hero_image": "https://...",
  ...
}

BACKEND:
1. Verify JWT token
2. Check admin_users table
3. Validate request data
4. Insert into communities table
5. Trigger audit log
6. Return created community

RESPONSE:
{
  "data": {
    "id": "uuid-123",
    "name": "Maasai Mara Community",
    "county": "Narok",
    "created_at": "2026-06-06T...",
    ...
  }
}

FRONTEND:
1. Parse response
2. Update React Query cache
3. Invalidate communities list
4. Refetch list
5. Show success message
6. Redirect to community detail
```

---

## 🎯 Key Integration Points

| Component         | Connects To       | Purpose                 |
| ----------------- | ----------------- | ----------------------- |
| API Service       | Backend REST API  | Data operations         |
| React Query Hooks | API Service       | Data fetching & caching |
| Page Components   | React Query Hooks | Display data            |
| Form Components   | Page Components   | User input              |
| Supabase Client   | Authentication    | User sessions           |
| Supabase Storage  | File uploads      | Media management        |
| Common Components | All Pages         | Reusable UI             |

---

## 🔄 Typical Page Load Sequence

```
1. User navigates to /admin/communities
2. React Router renders CommunitiesPage
3. Component calls useCommunities(page=1)
4. React Query:
   a. Checks cache for key ['communities', 'list', 1, 50]
   b. If missing, calls api.communityService.getAll(1, 50)
   c. Backend queries database
   d. Returns paginated results
   e. Stores in cache
5. Component receives data
6. Renders DataTable with communities
7. User can now:
   - View communities
   - Filter/search
   - Click to edit
   - Delete
   - Create new
8. On action, mutation runs
9. Cache invalidated
10. List automatically re-fetches

Total time: 200-500ms (network dependent)
```

---

## 📈 Scaling Considerations

As SafariSync grows:

- **Caching**: React Query handles repeated queries efficiently
- **Pagination**: List views use 50 items per page
- **Indexes**: Database indexes on commonly filtered fields
- **CDN**: Images served from Supabase Storage (CDN-backed)
- **Rate Limiting**: Implement on backend if needed
- **Search**: Full-text search on PostgreSQL
- **Analytics**: Aggregate metrics for dashboard

---

## 🎯 Error Handling Flow

```
User Action (Create, Update, Delete)
        ↓
Call API Function
        ├─ Network Error? → Show "Connection Error"
        ├─ 401? → Redirect to login
        ├─ 403? → Show "Unauthorized"
        ├─ 400? → Show validation error from server
        ├─ 500? → Show "Server Error"
        └─ Success? → Update cache & show success
                        ↓
                    Optional: Show toast notification
                        ↓
                    Reload affected data
```

---

This architecture ensures:
✅ Scalability
✅ Maintainability
✅ Performance
✅ Security
✅ User Experience
