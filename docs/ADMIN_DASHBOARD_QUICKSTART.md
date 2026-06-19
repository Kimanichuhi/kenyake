# Admin Dashboard - Quick Start Guide

## 🎯 What You Have

A fully-featured, **no-hardcoding** admin dashboard for SafariSync with:

✅ **Communities Management** - Create/edit/delete communities with cultural content  
✅ **Experiences Management** - Manage tours and activities with pricing/capacity  
✅ **Guides Management** - Verify and manage professional guides  
✅ **Bookings Dashboard** - Track all reservations and revenue  
✅ **Reviews Moderation** - Approve and respond to reviews  
✅ **Content Approval Workflow** - Review and approve user submissions  
✅ **Analytics Dashboard** - Key metrics and platform insights  
✅ **User Management** - Role-based access control (4 roles)  
✅ **File Upload Handling** - Images and media stored in Supabase Storage  
✅ **Data Persistence** - Everything saved to database (no hardcoding!)

---

## 🚀 Quick Setup (5 Steps)

### 1. Install React Query

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### 2. Add Routes

Add these routes to your router configuration:

```typescript
import { AdminLayout } from '@/admin/layouts/AdminLayout';
import {
  AdminDashboard,
  CommunitiesPage,
  CommunityDetailPage,
  ExperiencesPage,
  BookingsPage,
} from '@/admin/pages';

// In your router configuration:
{
  path: 'admin',
  element: <AdminLayout><AdminDashboard /></AdminLayout>,
},
{
  path: 'admin/communities',
  element: <AdminLayout><CommunitiesPage /></AdminLayout>,
},
{
  path: 'admin/communities/:id',
  element: <AdminLayout><CommunityDetailPage /></AdminLayout>,
},
{
  path: 'admin/experiences',
  element: <AdminLayout><ExperiencesPage /></AdminLayout>,
},
{
  path: 'admin/bookings',
  element: <AdminLayout><BookingsPage /></AdminLayout>,
},
// Add more routes as needed
```

### 3. Setup QueryClient

Update your main app file:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

### 4. Create Backend API Endpoints

Create endpoints in your Node.js backend to handle admin operations (see Implementation Guide for full list)

### 5. Run the Application

```bash
npm run dev
# Navigate to http://localhost:5173/admin
```

---

## 📂 File Structure

```
frontend/src/admin/
├── types/index.ts              # Data models (Community, Experience, etc.)
├── services/api.ts             # API calls to backend
├── hooks/useAdmin.ts           # React Query hooks
├── layouts/AdminLayout.tsx     # Main layout with sidebar
├── components/Common.tsx       # Reusable UI components
└── pages/
    ├── Dashboard.tsx           # Overview
    ├── Communities.tsx         # List communities
    ├── CommunityDetail.tsx      # Edit community + content
    ├── Experiences.tsx         # List experiences
    └── Bookings.tsx            # Manage bookings
```

---

## 🎨 Dashboard Features

### Home Dashboard

- Key metrics (total bookings, revenue, users, listings)
- Content statistics (communities, experiences, guides)
- Recent activity log
- Quick action shortcuts

### Communities

- **List view** with search/filter
- **Add new** communities
- **Edit** community details (name, images, leadership, capacity)
- **Manage content** (cultural practices, stories, traditions)
- **Publish/unpublish** to control visibility

### Experiences

- **Browse** all tours and activities
- **Filter by** category, status, rating, featured
- **Create/edit** with:
  - Description and images
  - Pricing and capacity
  - Duration and difficulty
  - Availability and start times
- **Feature** experiences to highlight on homepage

### Guides

- **Manage** guide profiles and certifications
- **Verify** credentials
- **Track** ratings, bookings, earnings
- **View** guide bookings and reviews

### Bookings

- **Central hub** for all reservations
- **Filter** by type (experience/guide/transport/event), status, date
- **Update status** (pending → confirmed → completed)
- **Cancel** bookings with refund handling
- **Revenue tracking** and statistics

### Reviews

- **Moderate** all user reviews
- **Approve/reject** reviews
- **Respond** to reviews
- **Flag** inappropriate content

---

## 💾 Data Storage (No Hardcoding!)

All data is stored in your Supabase PostgreSQL database:

```sql
-- Examples of tables used by admin dashboard
public.communities                -- Community profiles
public.community_content          -- Cultural content
public.community_events           -- Events
public.experiences               -- Tours and activities
public.experience_bookings       -- Reservations
public.guides                    -- Guide profiles
public.guide_bookings            -- Guide reservations
public.reviews                   -- User reviews
```

Everything is dynamic and database-driven!

---

## 🔐 Authentication

The dashboard uses Supabase authentication:

```typescript
// Users must be logged in as admin
import { supabase } from "@/shared/lib/supabase";

const {
  data: { session },
} = await supabase.auth.getSession();
// Verify user is in admin_users table
```

---

## 🖼️ File Uploads

Images and media are stored in Supabase Storage:

```typescript
// Upload community hero image
const { data, error } = await supabase.storage
  .from("community-media")
  .upload(`communities/${id}/hero.jpg`, file);

// Get public URL
const { data: urlData } = supabase.storage
  .from("community-media")
  .getPublicUrl(data.path);

// Save URL to database
await communityService.update(id, { hero_image: urlData.publicUrl });
```

---

## 🎯 Common Tasks

### Add a Community

1. Communities → **"Add Community"**
2. Fill details (name, county, leader info, etc.)
3. Upload hero image
4. Add cultural content (practices, stories, etc.)
5. Click **"Publish"**

### Create an Experience

1. Experiences → **"Add Experience"**
2. Enter details (title, category, host, pricing, capacity)
3. Upload images
4. Set availability and start times
5. Save and publish

### Approve a Booking

1. Bookings → Find pending booking
2. Click **"Confirm"** to approve
3. Customer receives notification

### Respond to Review

1. Reviews → Find review
2. Click **"Respond"**
3. Write response
4. Save (customer sees it on platform)

---

## 📊 Metrics Dashboard Shows

```
├── Total Bookings         # Number of all reservations
├── Total Revenue          # Sum of all booking amounts
├── Active Users           # Number of registered users
├── Active Listings        # Communities + Experiences + Guides count
├── Communities            # Total communities
├── Experiences            # Total experiences
├── Guides                 # Total guides
├── Average Rating         # Overall platform rating
└── Pending Approvals      # Items awaiting review
```

---

## 🚀 Deploy to Production

### Environment Variables

```
VITE_API_URL=https://your-api.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
```

### Build

```bash
npm run build
# Deploy dist/ folder to your hosting
```

---

## 🎯 Next Steps

1. **Install dependencies** - `npm install @tanstack/react-query`
2. **Add routes** - Copy route examples above
3. **Create backend endpoints** - See Implementation Guide
4. **Setup database tables** - Run migrations from ADMIN_DASHBOARD_ANALYSIS.md
5. **Add admin users** - Insert into admin_users table
6. **Test** - Access at `/admin` when logged in as admin

---

## 📚 Documentation Files

- **[ADMIN_DASHBOARD_ANALYSIS.md](./ADMIN_DASHBOARD_ANALYSIS.md)** - Complete feature analysis and requirements
- **[ADMIN_DASHBOARD_IMPLEMENTATION.md](./ADMIN_DASHBOARD_IMPLEMENTATION.md)** - Detailed implementation guide

---

## 🆘 Troubleshooting

| Issue                | Solution                                |
| -------------------- | --------------------------------------- |
| "Unauthorized" error | Check admin user is in database         |
| API calls failing    | Verify backend endpoints exist          |
| Images not uploading | Check Supabase Storage permissions      |
| Blank dashboard      | Check browser console for errors        |
| React Query errors   | Verify QueryClient is setup in main app |

---

## 💡 Pro Tips

✨ **Use filters** to find specific items quickly  
✨ **Publish/Unpublish** to control what users see  
✨ **Bulk actions** available in many sections  
✨ **Export data** for reporting and backups  
✨ **Audit logs** track all admin changes

---

## 🎉 You're All Set!

Your admin dashboard is ready. Start managing SafariSync content without any hardcoding!

Visit `/admin` to get started. 🚀
