// Admin User Roles
export type AdminRole = 'super_admin' | 'content_manager' | 'marketplace_manager' | 'moderator' | 'analytics_viewer';

// Admin User
export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  permissions: string[];
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

// Communities
export interface Community {
  id: string;
  slug: string;
  name: string;
  county: string;
  region?: string;
  hero_image?: string;
  description?: string;
  origin_story?: string;
  history?: string;
  population?: number;
  established_year?: string;
  specialty?: string;
  traditional_dress?: string;
  adornment_explanation?: string;
  leader_name?: string;
  leader_title?: string;
  contact_email?: string;
  contact_phone?: string;
  max_daily_visitors?: number;
  current_visitor_count?: number;
  visitor_guidelines?: string;
  ecological_knowledge?: string;
  lat?: number;
  lng?: number;
  is_published: boolean;
  managed_by?: string;
  created_at: Date;
  updated_at: Date;
}

// Community Content
export interface CommunityContent {
  id: string;
  community_id: string;
  content_type: 'cultural_practice' | 'phrase' | 'sacred_site' | 'dos_donts' | 'oral_history' | 'tradition' | 'ecological_knowledge';
  title: string;
  body?: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'audio';
  metadata?: Record<string, any>;
  sort_order?: number;
  created_at: Date;
}

// Community Events
export interface CommunityEvent {
  id: string;
  community_id: string;
  title: string;
  slug: string;
  event_type: 'ceremony' | 'festival' | 'market' | 'celebration' | 'naming' | 'harvest' | 'age_set';
  description?: string;
  start_date: Date;
  end_date?: Date;
  start_time?: string;
  end_time?: string;
  recurrence?: 'weekly' | 'monthly' | 'yearly' | 'once';
  recurrence_detail?: string;
  location_name?: string;
  county?: string;
  lat?: number;
  lng?: number;
  max_attendees?: number;
  current_attendees?: number;
  invitation_required?: boolean;
  price?: string;
  what_to_bring?: string;
  what_to_wear?: string;
  etiquette_notes?: string;
  preparation_guide?: string;
  cover_image?: string;
  is_published: boolean;
  is_past: boolean;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

// Experiences
export interface Experience {
  id: string;
  title: string;
  slug: string;
  category: 'cultural' | 'food' | 'nature' | 'adventure' | 'homestay' | 'community' | 'photography' | 'volunteer';
  subcategory?: string;
  description?: string;
  short_description?: string;
  host_name: string;
  host_bio?: string;
  host_photo?: string;
  community_id?: string;
  location_name?: string;
  county?: string;
  lat?: number;
  lng?: number;
  duration_minutes?: number;
  price_amount: number;
  price_currency: string;
  price_display?: string;
  max_guests?: number;
  min_guests?: number;
  rating?: number;
  review_count?: number;
  cover_image?: string;
  gallery_images?: string[];
  what_to_bring?: string;
  what_to_wear?: string;
  skill_level?: string;
  languages?: string[];
  includes?: string[];
  accessibility_notes?: string;
  is_published: boolean;
  is_featured: boolean;
  available_days?: string[];
  start_times?: string[];
  created_at: Date;
  updated_at: Date;
}

// Guides
export interface Guide {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  photo_url?: string;
  bio?: string;
  languages?: string[];
  specializations?: string[];
  certifications?: string[];
  certification_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  location?: string;
  county?: string;
  lat?: number;
  lng?: number;
  price_per_day?: number;
  price_currency: string;
  rating: number;
  review_count: number;
  years_experience?: number;
  response_time_minutes?: number;
  is_available: boolean;
  is_verified: boolean;
  is_published: boolean;
  total_earnings: number;
  total_bookings: number;
  created_at: Date;
  updated_at: Date;
}

// Bookings
export interface Booking {
  id: string;
  user_id: string;
  booking_type: 'experience' | 'guide' | 'transport' | 'event';
  booking_id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  booking_date: Date;
  total_price?: number;
  currency?: string;
  created_at: Date;
  updated_at: Date;
  details?: Record<string, any>;
}

// Reviews
export interface Review {
  id: string;
  entity_type: 'experience' | 'guide' | 'community';
  entity_id: string;
  user_id: string;
  rating: number;
  title?: string;
  body?: string;
  is_approved: boolean;
  created_at: Date;
}

// Audit Log
export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  created_at: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Dashboard Metrics
export interface DashboardMetrics {
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  activeListings: number;
  pendingApprovals: number;
  communityCount: number;
  experienceCount: number;
  guideCount: number;
  averageRating: number;
  recentActivity: AuditLog[];
}
