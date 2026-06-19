# SafariSync Admin Dashboard - Integration Guide

## 🎯 Get Started in 30 Minutes

This guide will walk you through integrating the admin dashboard into your existing SafariSync application.

---

## ✅ Prerequisites

- ✓ React/TypeScript frontend already running
- ✓ Backend Node.js/Express server
- ✓ Supabase project setup
- ✓ TailwindCSS configured

---

## 📋 Step-by-Step Integration

### Step 1: Install React Query (2 minutes)

```bash
cd frontend
npm install @tanstack/react-query @tanstack/react-query-devtools
```

**Verify installation:**

```bash
npm list @tanstack/react-query
```

---

### Step 2: Wrap App with QueryClientProvider (3 minutes)

**Find your main App component or main.tsx:**

```typescript
// frontend/src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

---

### Step 3: Add Admin Routes (5 minutes)

**Update your router configuration:**

```typescript
// frontend/src/app/router.tsx or similar
import { AdminLayout } from '@/admin/layouts/AdminLayout';
import {
  AdminDashboard,
  CommunitiesPage,
  CommunityDetailPage,
  ExperiencesPage,
  BookingsPage,
} from '@/admin/pages';

export const adminRoutes = [
  {
    path: 'admin',
    element: (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    ),
  },
  {
    path: 'admin/communities',
    element: (
      <AdminLayout>
        <CommunitiesPage />
      </AdminLayout>
    ),
  },
  {
    path: 'admin/communities/:id',
    element: (
      <AdminLayout>
        <CommunityDetailPage />
      </AdminLayout>
    ),
  },
  {
    path: 'admin/experiences',
    element: (
      <AdminLayout>
        <ExperiencesPage />
      </AdminLayout>
    ),
  },
  {
    path: 'admin/bookings',
    element: (
      <AdminLayout>
        <BookingsPage />
      </AdminLayout>
    ),
  },
];

// Then add to your main route configuration
const routes = [
  ...otherRoutes,
  ...adminRoutes,
];
```

---

### Step 4: Create Environment Variables (2 minutes)

**Create/update frontend/.env.local:**

```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Update services/api.ts to use environment variable:**

```typescript
// In frontend/src/admin/services/api.ts
const API_URL = import.meta.env.VITE_API_URL || "/api";
```

---

### Step 5: Create Backend API Endpoints (15 minutes)

**Create admin routes file:**

```typescript
// backend/src/routes/admin.ts
import express from "express";
import { verifyAdminAuth } from "../middleware/auth";
import { supabase } from "../lib/supabase";

const router = express.Router();

// Middleware: Verify admin authentication
router.use(verifyAdminAuth);

// ==================== COMMUNITIES ====================

// List communities
router.get("/communities", async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const {
      data: communities,
      count,
      error,
    } = await supabase
      .from("communities")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) throw error;

    res.json({
      data: communities,
      total: count || 0,
      page: Number(page),
      limit: Number(limit),
      hasMore: offset + Number(limit) < (count || 0),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch communities" });
  }
});

// Get single community
router.get("/communities/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch community" });
  }
});

// Create community
router.post("/communities", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("communities")
      .insert([
        {
          ...req.body,
          managed_by: req.user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Log this action
    await supabase.from("admin_audit_logs").insert([
      {
        admin_id: req.user.admin_id,
        action: "CREATE",
        table_name: "communities",
        record_id: data.id,
        new_values: data,
      },
    ]);

    res.status(201).json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to create community" });
  }
});

// Update community
router.put("/communities/:id", async (req, res) => {
  try {
    const { data: oldData } = await supabase
      .from("communities")
      .select("*")
      .eq("id", req.params.id)
      .single();

    const { data, error } = await supabase
      .from("communities")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Log this action
    await supabase.from("admin_audit_logs").insert([
      {
        admin_id: req.user.admin_id,
        action: "UPDATE",
        table_name: "communities",
        record_id: data.id,
        old_values: oldData,
        new_values: data,
      },
    ]);

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to update community" });
  }
});

// Delete community
router.delete("/communities/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("communities")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    // Log this action
    await supabase.from("admin_audit_logs").insert([
      {
        admin_id: req.user.admin_id,
        action: "DELETE",
        table_name: "communities",
        record_id: req.params.id,
      },
    ]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete community" });
  }
});

// Publish community
router.patch("/communities/:id/publish", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("communities")
      .update({ is_published: true })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to publish community" });
  }
});

// ==================== EXPERIENCES ====================

// List experiences (similar pattern)
router.get("/experiences", async (req, res) => {
  try {
    const { page = 1, limit = 50, category, status, featured } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase.from("experiences").select("*", { count: "exact" });

    if (category) query = query.eq("category", category);
    if (status) query = query.eq("status", status);
    if (featured !== undefined)
      query = query.eq("is_featured", featured === "true");

    const {
      data: experiences,
      count,
      error,
    } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) throw error;

    res.json({
      data: experiences,
      total: count || 0,
      page: Number(page),
      limit: Number(limit),
      hasMore: offset + Number(limit) < (count || 0),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch experiences" });
  }
});

// Create experience
router.post("/experiences", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("experiences")
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to create experience" });
  }
});

// ==================== BOOKINGS ====================

// List bookings
router.get("/bookings", async (req, res) => {
  try {
    const { page = 1, limit = 50, status, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase.from("bookings").select("*", { count: "exact" });

    if (status) query = query.eq("status", status);
    if (type) query = query.eq("booking_type", type);

    const {
      data: bookings,
      count,
      error,
    } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) throw error;

    res.json({
      data: bookings,
      total: count || 0,
      page: Number(page),
      limit: Number(limit),
      hasMore: offset + Number(limit) < (count || 0),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Update booking status
router.patch("/bookings/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const { data, error } = await supabase
      .from("bookings")
      .update({ status, updated_at: new Date() })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// ==================== DASHBOARD ====================

// Get dashboard metrics
router.get("/dashboard/metrics", async (req, res) => {
  try {
    const { data: bookingMetrics } = await supabase
      .from("bookings")
      .select("total_price", { count: "exact" });

    const { data: users } = await supabase
      .from("users")
      .select("*", { count: "exact" });

    const { data: listings } = await supabase
      .from("experiences")
      .select("*", { count: "exact" });

    res.json({
      totalBookings: bookingMetrics?.length || 0,
      totalRevenue:
        bookingMetrics?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0,
      activeUsers: users?.length || 0,
      activeListings: listings?.length || 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

export default router;
```

**Register the routes in main server file:**

```typescript
// backend/src/server.ts
import adminRoutes from "./routes/admin";

// After other middleware setup:
app.use("/api/admin", adminRoutes);
```

---

### Step 6: Setup Authentication Middleware (5 minutes)

**Create auth middleware:**

```typescript
// backend/src/middleware/auth.ts
import { supabase } from "../lib/supabase";

export async function verifyAdminAuth(req: any, res: any, next: any) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify JWT with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Check if user is admin
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (adminError || !adminUser) {
      return res.status(403).json({ error: "Not an admin user" });
    }

    // Attach to request
    req.user = {
      id: user.id,
      admin_id: adminUser.id,
      role: adminUser.role,
    };

    next();
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" });
  }
}
```

---

### Step 7: Database Setup (3 minutes)

**Create these tables in Supabase SQL Editor:**

```sql
-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'content_manager', 'marketplace_manager', 'moderator')),
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit logs table
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

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view users" ON admin_users
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'super_admin'));

CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true));
```

---

### Step 8: Create First Admin User (2 minutes)

**In Supabase, after creating a user manually:**

```sql
INSERT INTO admin_users (user_id, role, is_active)
VALUES ('user-uuid-from-auth-table', 'super_admin', true);
```

---

### Step 9: Test the Integration (2 minutes)

1. **Start your frontend:**

   ```bash
   npm run dev
   ```

2. **Start your backend:**

   ```bash
   npm start
   ```

3. **Login to your app** (if required)

4. **Navigate to admin:**

   ```
   http://localhost:5173/admin
   ```

5. **You should see:**
   - Admin dashboard
   - Sidebar navigation
   - Dashboard with metrics
   - Communities page

---

## 🎉 Success Checklist

- ✅ React Query installed and configured
- ✅ Routes added and working
- ✅ Backend API endpoints created
- ✅ Database tables created
- ✅ Authentication middleware setup
- ✅ Admin user created
- ✅ Can access `/admin` page
- ✅ Can see communities/experiences data

---

## 🔧 Troubleshooting

### Issue: "Cannot find module @/admin"

**Solution:** Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: "API Error 401 Unauthorized"

**Solution:** Check:

1. Supabase token in request headers
2. User exists in `admin_users` table
3. `is_active` is `true`

### Issue: "React Query not fetching data"

**Solution:**

1. Check browser Network tab for API calls
2. Verify backend endpoints exist
3. Check CORS configuration

### Issue: "Images not uploading"

**Solution:**

1. Check Supabase Storage bucket exists
2. Verify bucket is public
3. Check file size limits

---

## 📚 Next Steps

1. **Add more pages** - Create Guides, Reviews, Settings pages
2. **Implement approvals** - Add content approval workflow
3. **Setup email** - Send notifications on actions
4. **Add charts** - Use Recharts for advanced analytics
5. **Bulk operations** - Import/export CSV data

---

## 🚀 You're Ready!

The admin dashboard is now integrated and ready to use. Start managing your SafariSync platform content! 🎊
