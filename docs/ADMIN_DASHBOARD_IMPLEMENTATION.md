# SafariSync Admin Dashboard - Implementation Guide

## Overview

The SafariSync Admin Dashboard is a comprehensive management system for:

- **Communities**: Create and manage community profiles with rich cultural content
- **Experiences**: Manage tours, activities, and unique experiences without hardcoding
- **Guides**: Verify and manage professional guides
- **Bookings**: Track and manage all reservations across the platform
- **Reviews**: Moderate and respond to user reviews
- **Content**: Approve and manage all user-generated content
- **Analytics**: View platform metrics and performance data

All content is stored in the database with no hardcoding, allowing for dynamic management.

---

## 📁 Project Structure

```
frontend/src/admin/
├── types/
│   └── index.ts                 # TypeScript interfaces for all data models
├── services/
│   └── api.ts                   # API client for admin operations
├── hooks/
│   └── useAdmin.ts              # React Query hooks for data fetching
├── layouts/
│   └── AdminLayout.tsx          # Main admin layout with sidebar navigation
├── components/
│   └── Common.tsx               # Reusable UI components (Table, Form, etc.)
└── pages/
    ├── Dashboard.tsx            # Overview dashboard with key metrics
    ├── Communities.tsx          # Communities listing and management
    ├── CommunityDetail.tsx       # Community detail and content management
    ├── Experiences.tsx          # Experiences listing and filters
    ├── Bookings.tsx             # Bookings management and tracking
    ├── Reviews.tsx              # Review moderation (to be created)
    └── index.ts                 # Exports all pages
```

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

The admin dashboard requires TanStack Query (React Query) for state management:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Step 2: Update Frontend Router

Add admin routes to your main router file (`frontend/src/app/router.tsx` or equivalent):

```typescript
import { AdminLayout } from '@/admin/layouts/AdminLayout';
import {
  AdminDashboard,
  CommunitiesPage,
  CommunityDetailPage,
  ExperiencesPage,
  BookingsPage,
} from '@/admin/pages';

// Add to your router configuration
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
```

### Step 3: Setup QueryClient Provider

Update your `main.tsx` or `App.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourRouter />
    </QueryClientProvider>
  );
}
```

### Step 4: Create Backend API Endpoints

The admin dashboard expects the following backend endpoints. Create these in your backend (`backend/src/routes/admin.ts`):

#### Communities Endpoints

```
GET    /api/communities                 - List communities with pagination
GET    /api/communities/:id             - Get single community
POST   /api/communities                 - Create community
PUT    /api/communities/:id             - Update community
DELETE /api/communities/:id             - Delete community
PATCH  /api/communities/:id/publish     - Publish community
PATCH  /api/communities/:id/unpublish   - Unpublish community
POST   /api/communities/:id/hero-image  - Upload hero image
```

#### Community Content Endpoints

```
GET    /api/communities/:id/content                        - Get content
POST   /api/communities/:id/content                        - Create content
PUT    /api/communities/:id/content/:contentId             - Update content
DELETE /api/communities/:id/content/:contentId             - Delete content
POST   /api/communities/:id/media                          - Upload media
```

#### Experiences Endpoints

```
GET    /api/experiences                 - List experiences
GET    /api/experiences/:id             - Get single experience
POST   /api/experiences                 - Create experience
PUT    /api/experiences/:id             - Update experience
DELETE /api/experiences/:id             - Delete experience
PATCH  /api/experiences/:id/publish     - Publish experience
PATCH  /api/experiences/:id/feature     - Feature experience
POST   /api/experiences/:id/cover       - Upload cover image
POST   /api/experiences/:id/gallery     - Upload gallery images
```

#### Bookings Endpoints

```
GET    /api/bookings                    - List bookings with filters
GET    /api/bookings/:id                - Get single booking
PATCH  /api/bookings/:id                - Update booking status
POST   /api/bookings/:id/cancel         - Cancel booking
POST   /api/bookings/:id/notify         - Send notification
```

#### Guides Endpoints

```
GET    /api/guides                      - List guides
GET    /api/guides/:id                  - Get single guide
PUT    /api/guides/:id                  - Update guide
PATCH  /api/guides/:id/verify           - Verify guide
PATCH  /api/guides/:id/publish          - Publish guide
GET    /api/guides/:id/bookings         - Get guide's bookings
GET    /api/guides/:id/reviews          - Get guide's reviews
```

#### Dashboard Endpoints

```
GET    /api/dashboard/metrics           - Key metrics
GET    /api/dashboard/activity          - Recent activity log
GET    /api/dashboard/analytics         - Analytics data
```

### Step 5: Database Migrations

Create these tables for the admin system:

```sql
-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'content_manager', 'marketplace_manager', 'moderator')),
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit logging table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Content approval workflow
CREATE TABLE IF NOT EXISTS content_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID,
  reviewed_by UUID,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_approvals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can view users" ON admin_users FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'super_admin')
);

CREATE POLICY "Admins can view audit logs" ON admin_audit_logs FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true)
);

CREATE POLICY "Admins can view approvals" ON content_approvals FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true)
);
```

---

## 🔐 Authentication & Authorization

### Role-Based Access Control

The admin dashboard supports 4 main roles:

1. **Super Admin** - Full platform access
2. **Content Manager** - Manage communities, experiences, events
3. **Marketplace Manager** - Manage guides, transport, accommodations
4. **Moderator** - Review and moderate content

### Setting Admin Access

Add a user as admin via Supabase:

```sql
INSERT INTO admin_users (user_id, role, permissions, is_active)
VALUES (
  'user-uuid-from-auth',
  'super_admin',
  '["manage_all"]'::jsonb,
  true
);
```

### Protecting Routes

Create a ProtectedAdminRoute component:

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase';

export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login');
        return;
      }

      // Check if user is admin in your database
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!data) {
        navigate('/');
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdminAccess();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Unauthorized</div>;

  return <>{children}</>;
}
```

---

## 📊 Key Features Explained

### 1. **Dashboard**

- Real-time metrics (bookings, revenue, users)
- Content overview (communities, experiences, guides)
- Recent activity feed
- Quick action shortcuts

### 2. **Communities Management**

- CRUD operations for communities
- Hero image uploads
- Community content management (cultural practices, stories, etc.)
- Publish/unpublish control
- Visitor capacity management

### 3. **Experiences Management**

- Create experiences with rich descriptions
- Category filtering (cultural, food, nature, adventure, etc.)
- Image gallery management
- Pricing and capacity management
- Featured experiences highlighting
- Rating and review display

### 4. **Bookings Management**

- View all bookings across experience types
- Status tracking (pending, confirmed, completed, cancelled)
- Filtering by date range and type
- Revenue tracking
- Customer notifications
- Cancellation and refund handling

### 5. **Review Moderation**

- Approve/reject user reviews
- Respond to reviews
- Flag inappropriate content
- Rating threshold management

---

## 🛠️ Common Tasks

### Adding a New Community

1. Click **"Add Community"** button on Communities page
2. Fill in basic information:
   - Community name
   - County and region
   - Hero image
   - Description and history
   - Leadership info
   - Visitor guidelines
3. Click **"Save Community"**
4. Add community content (cultural practices, stories, etc.)
5. Click **"Publish"** to make visible to users

### Creating an Experience

1. Go to Experiences page
2. Click **"Add Experience"**
3. Fill in:
   - Title and category
   - Host information
   - Location and duration
   - Pricing and capacity
   - What to bring/wear
   - Images
4. Set availability and start times
5. Save and publish

### Managing Bookings

1. Go to Bookings page
2. Filter by type, status, or date
3. Click on a booking to view details
4. Update status (confirm, complete, cancel)
5. Send notifications if needed

---

## 📱 File Upload Handling

The dashboard uses Supabase Storage for file uploads:

```typescript
// Hero image upload
const { data, error } = await supabase.storage
  .from("community-media")
  .upload(`communities/${communityId}/hero-${Date.now()}.jpg`, file);

// Get public URL
const { data: urlData } = supabase.storage
  .from("community-media")
  .getPublicUrl(data.path);

// Use urlData.publicUrl in your database
```

---

## 🎨 Customization

### Adding More Filters

Edit the filter section in any page:

```typescript
<Select
  value={filters.category || ''}
  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
>
  <option value="">All Categories</option>
  {/* Add your options */}
</Select>
```

### Styling

All components use Tailwind CSS. Modify styles in `Common.tsx` component classes.

### Adding New Pages

1. Create page in `pages/` folder
2. Export from `pages/index.ts`
3. Add route to router
4. Add to sidebar in `AdminLayout.tsx`

---

## 🐛 Troubleshooting

### API Errors

**Issue:** "API Error: 401 Unauthorized"

- **Solution:** Check authentication token in headers
- Ensure Supabase session is active

**Issue:** "Failed to upload media"

- **Solution:** Check Supabase Storage bucket permissions
- Verify file size limits

### Query Errors

**Issue:** "React Query failed to fetch"

- **Solution:** Check backend API endpoints exist
- Verify CORS settings on backend
- Check QueryClient configuration

### Display Issues

**Issue:** Data not showing in tables

- **Solution:** Check browser console for errors
- Verify data format matches TypeScript interfaces
- Check pagination logic

---

## 📚 API Documentation

All API calls are made through `services/api.ts`. Example:

```typescript
// Get communities
const { data, total, page, limit, hasMore } = await communityService.getAll(
  1,
  50,
);

// Create community
const newCommunity = await communityService.create({
  name: "New Community",
  county: "Nairobi",
});

// Update community
const updated = await communityService.update(communityId, {
  name: "Updated Name",
});

// Upload hero image
const { url } = await communityService.uploadHeroImage(communityId, file);
```

---

## 🔄 Approval Workflow

For content that needs approval:

1. User/Manager submits content
2. Admin sees it in pending approvals
3. Admin reviews and approves/rejects
4. Email notification sent to submitter
5. Content becomes live or shows revision feedback

---

## 📈 Performance Optimization

- **React Query Caching:** Configured 5-minute cache for list queries
- **Pagination:** 50 items per page to reduce load
- **Image Optimization:** Consider adding image resizing on upload
- **Lazy Loading:** Media loads on demand
- **Debouncing:** Search/filter inputs are debounced

---

## 🚀 Deployment

### Environment Variables

Create `.env.local` in frontend:

```
VITE_API_URL=https://your-api.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Building

```bash
npm run build
npm run preview
```

### Deployment Checklist

- ✅ Environment variables configured
- ✅ Backend API endpoints deployed
- ✅ Database migrations applied
- ✅ Supabase Storage bucket created
- ✅ Authentication configured
- ✅ Admin users added to database
- ✅ CORS settings configured on backend
- ✅ SSL certificate installed

---

## 📞 Support & Contributions

For issues or feature requests:

1. Check the [Admin Dashboard Analysis](./ADMIN_DASHBOARD_ANALYSIS.md)
2. Review API error messages in browser console
3. Check backend logs for API errors
4. Verify database queries are returning data

---

## 📝 License

SafariSync Admin Dashboard © 2026
