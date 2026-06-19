# SafariSync Admin Dashboard - Feature Analysis & Requirements

## 1. PLATFORM OVERVIEW

Sync Safaris is an AI-powered, community-first tourism intelligence platform for Kenya combining:

- Trip planning with AI/wildlife intelligence
- Community knowledge graph (culture, history, ecology)
- Marketplace (guides, experiences, transport, accommodations)
- Offline-first PWA
- Impact tracking and blockchain revenue splits

---

## 2. ADMIN FEATURES REQUIRING MANAGEMENT (WITHOUT HARDCODING)

### 2.1 **CONTENT MANAGEMENT MODULES**

#### A. **Destinations Management**

- **What to manage**: Destination profiles with cultural context, ecological info, attractions
- **Current state**: Static data in migrations
- **Admin needs**:
  - Create/Edit/Delete destinations
  - Manage destination descriptions, images, key attractions
  - Set visitor guidelines and capacity limits
  - Approve/publish destinations

#### B. **Communities Management** ⭐ (Highest Priority)

- **What to manage**: Community profiles, leadership, branding, contact info
- **Database**: `public.communities` table
- **Fields to manage**:
  - Basic info: name, slug, county, region
  - Hero images and gallery
  - Origin story, history, population
  - Cultural details (traditional dress, adornments)
  - Leadership info (leader name, title, contact)
  - Visitor capacity and guidelines
  - Ecological knowledge
  - Publishing status

#### C. **Community Content & Media** ⭐ (High Priority)

- **What to manage**: Cultural practices, phrases, sacred sites, stories, traditions
- **Database**: `public.community_content` & `public.community_gallery`
- **Content types**: cultural_practice, phrase, sacred_site, dos_donts, oral_history, tradition, ecological_knowledge
- **Admin needs**:
  - Create rich media content (text + images/video/audio)
  - Organize content by type and community
  - Manage media uploads with approval workflow
  - Sort and order content display

#### D. **Community Events** ⭐ (High Priority)

- **What to manage**: Festivals, ceremonies, markets, celebrations
- **Database**: `public.community_events`
- **Fields**: event type, dates, times, capacity, etiquette, location, pricing
- **Admin needs**:
  - Create recurring events
  - Manage invitations and attendee requests
  - View and respond to visitor inquiries

#### E. **Guides Management**

- **What to manage**: Guide profiles, specializations, availability, certifications
- **Database**: `public.guides` & `public.guide_availability`
- **Admin needs**:
  - Verify guide credentials and certifications
  - Manage guide profiles (photos, bio, specializations)
  - Set availability calendar
  - View booking requests and manage statuses
  - Monitor guide ratings and reviews

#### F. **Experiences & Activities** ⭐ (High Priority)

- **What to manage**: Cultural experiences, food tours, nature walks, adventure activities
- **Database**: `public.experiences` & `public.experience_bookings`
- **Experience types**: cultural, food, nature, adventure, homestay, community, photography, volunteer
- **Admin needs**:
  - Create/Edit/Delete experiences with rich descriptions
  - Manage experience gallery (multiple images)
  - Set pricing, duration, capacity, availability
  - Manage booking requests
  - Feature experiences on homepage

#### G. **Transportation Management**

- **What to manage**: Drivers, vehicles, routes, road conditions, park gates
- **Database**: `public.transport_drivers`, `public.transport_vehicles`, `public.transport_routes`, `public.park_gates`
- **Admin needs**:
  - Create driver profiles with verification
  - Manage vehicle inventory (type, capacity, features, pricing)
  - Create transport routes (matatu, shuttle, walking trails)
  - Manage park gates info (opening hours, fees, requirements)
  - Monitor transport bookings

#### H. **Educational Modules**

- **What to manage**: Pre-travel education content
- **Database**: `public.education_modules` & `public.education_lessons`
- **Admin needs**:
  - Create learning modules and lessons
  - Add quiz questions
  - Manage module publishing
  - View user progress and certifications

#### I. **Wildlife & Nature Data**

- **What to manage**: Park information, wildlife sightings verification, road conditions
- **Database**: `public.wildlife_sightings`, `public.road_conditions`
- **Admin needs**:
  - Verify wildlife sightings (crowdsourced data)
  - Update road conditions
  - Manage park details

#### J. **User & Booking Management**

- **What to manage**: User profiles, bookings across all services
- **Database**: `public.profiles`, `experience_bookings`, `guide_bookings`, `transport_bookings`
- **Admin needs**:
  - View user profiles and activity
  - Manage all booking requests
  - Track payment status
  - Handle disputes and cancellations

#### K. **Review & Rating Management**

- **What to manage**: Community reviews, guide reviews, experience reviews
- **Databases**: `community_review_responses`, `guide_reviews`, `experience_reviews`
- **Admin needs**:
  - Monitor and moderate reviews
  - Respond to negative reviews
  - Flag inappropriate content

#### L. **Media & Asset Management**

- **What to manage**: All uploaded media files
- **Storage**: Supabase Storage (community-media bucket)
- **Admin needs**:
  - Approve media uploads
  - Delete inappropriate content
  - Optimize and manage storage

---

## 3. ADMIN DASHBOARD ARCHITECTURE

### 3.1 **Core Admin Features**

```
ADMIN DASHBOARD
├── Dashboard (Overview & Analytics)
├── Content Management
│   ├── Destinations
│   ├── Communities
│   ├── Community Content
│   ├── Experiences
│   └── Events
├── Marketplace Management
│   ├── Guides
│   ├── Transport
│   ├── Accommodations
│   └── Marketplace Listings
├── Bookings & Reservations
│   ├── Experience Bookings
│   ├── Guide Bookings
│   ├── Transport Bookings
│   └── Event Invitations
├── User Management
│   ├── User Profiles
│   ├── Roles & Permissions
│   └── Activity Log
├── Media Management
│   ├── Bulk Upload
│   ├── Approval Workflow
│   └── Asset Library
├── Reviews & Moderation
│   ├── Review Moderation
│   ├── Response Management
│   └── Quality Monitoring
├── Analytics & Reports
│   ├── Platform Metrics
│   ├── Booking Analytics
│   ├── Revenue Tracking
│   └── User Behavior
└── Settings
    ├── Site Configuration
    ├── Email Templates
    ├── Payment Settings
    └── System Configuration
```

### 3.2 **Role-Based Access**

- **Super Admin**: Full platform access
- **Content Manager**: Communities, experiences, events, education
- **Marketplace Manager**: Guides, transport, accommodations
- **Moderator**: Reviews, user management, content approval
- **Analytics Viewer**: Read-only analytics and reports
- **Community Manager**: Own community + content only

---

## 4. TECHNOLOGY STACK

### Frontend

- **Framework**: React (using Vite from your current setup)
- **UI Components**: Consider shadcn/ui (used in many admin dashboards)
- **State Management**: TanStack Query (React Query) for data fetching
- **Forms**: React Hook Form + Zod for validation
- **Styling**: Tailwind CSS (already in your setup)
- **Charts**: Recharts for analytics
- **Rich Text Editor**: Quill or TipTap for content editing
- **File Upload**: Uppy or similar for media management

### Backend

- **API**: Extend existing Node.js/TypeScript backend
- **Database**: Supabase PostgreSQL (existing)
- **Authentication**: Supabase Auth with custom permissions
- **File Storage**: Supabase Storage
- **API Documentation**: OpenAPI/Swagger

### Database Enhancements

- Add `admin_users` table with roles/permissions
- Add `content_approvals` table for workflow
- Add `admin_audit_log` for tracking changes
- Add `admin_settings` for configuration

---

## 5. KEY REQUIREMENTS

### 5.1 **No Hardcoding**

- All content stored in database
- Configuration driven
- Email templates in database
- Feature flags for A/B testing
- Dynamic form fields

### 5.2 **Content Approval Workflow**

- Community-generated content → Pending
- Admin review → Approved/Rejected
- Email notifications to content creators
- Revision requests with feedback

### 5.3 **Bulk Operations**

- Bulk import via CSV
- Bulk status updates
- Bulk media upload
- Batch email notifications

### 5.4 **Search & Filtering**

- Full-text search across content
- Advanced filters (date range, status, rating, etc.)
- Saved views/filters
- Export results

### 5.5 **Audit & Compliance**

- Track all changes (who, what, when)
- Undo/restore functionality
- Compliance reports
- Data backup management

### 5.6 **Performance**

- Paginated lists (50-100 per page)
- Lazy loading of media
- Caching for frequently accessed data
- Optimistic UI updates

---

## 6. IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1-2)

- Admin authentication & authorization
- Base admin layout and navigation
- Role-based access control (RBAC)
- Audit logging

### Phase 2: Content Management (Week 3-4)

- Destinations CRUD
- Communities CRUD with rich media
- Community Content management
- Community Events management

### Phase 3: Marketplace (Week 5-6)

- Guides management
- Transport management
- Experience/Activity management
- Accommodation listings

### Phase 4: Operations (Week 7-8)

- Booking management dashboard
- User management
- Review moderation
- Email notifications

### Phase 5: Analytics (Week 9-10)

- Dashboard analytics
- Booking trends
- Revenue reports
- User behavior insights

### Phase 6: Advanced Features (Week 11+)

- Bulk operations
- Approval workflows
- Content scheduling
- A/B testing tools

---

## 7. DATA MODELS FOR ADMIN SYSTEM

### New Tables Needed

```sql
-- Admin users and roles
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL (Supabase Auth),
  role TEXT NOT NULL ('super_admin', 'content_manager', 'marketplace_manager', 'moderator'),
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Content approval workflow
CREATE TABLE content_approvals (
  id UUID PRIMARY KEY,
  content_type TEXT,
  content_id UUID,
  status TEXT ('pending', 'approved', 'rejected'),
  submitted_by UUID,
  reviewed_by UUID,
  review_notes TEXT,
  created_at TIMESTAMP,
  reviewed_at TIMESTAMP
);

-- Audit logging
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY,
  admin_id UUID,
  action TEXT,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP
);

-- Admin settings
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE,
  value JSONB,
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMP
);

-- Email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  variables JSONB,
  created_at TIMESTAMP
);
```

---

## 8. NEXT STEPS

1. ✅ Analysis complete
2. Create database migrations for admin system
3. Implement backend API endpoints for admin operations
4. Build admin dashboard UI (React components)
5. Integrate with Supabase authentication
6. Add file upload handling
7. Implement audit logging
8. Create approval workflows
9. Add analytics dashboard
10. Deploy to production
