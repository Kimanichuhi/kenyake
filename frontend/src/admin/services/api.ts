import { supabase } from '@/integrations/supabase/client';
import type {
  Community,
  CommunityContent,
  CommunityEvent,
  Experience,
  Guide,
  Booking,
  Review,
  PaginatedResponse,
  DashboardMetrics,
} from '../types';

const paginate = <T>(
  data: T[],
  count: number | null,
  page: number,
  limit: number
): PaginatedResponse<T> => ({
  data: data ?? [],
  total: count ?? 0,
  page,
  limit,
  hasMore: (count ?? 0) > page * limit,
});

// ============ COMMUNITIES ============
export const communityService = {
  async getAll(page = 1, limit = 50): Promise<PaginatedResponse<Community>> {
    const from = (page - 1) * limit;
    const { data, count, error } = await supabase
      .from('communities')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw new Error(error.message);
    return paginate(data as unknown as Community[], count, page, limit);
  },

  async getById(id: string): Promise<Community> {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as Community;
  },

  async create(communityData: Partial<Community>): Promise<Community> {
    const { data, error } = await supabase
      .from('communities')
      .insert([communityData as any])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as Community;
  },

  async update(id: string, communityData: Partial<Community>): Promise<Community> {
    const { data, error } = await supabase
      .from('communities')
      .update(communityData as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as Community;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('communities').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async publish(id: string): Promise<Community> {
    return communityService.update(id, { is_published: true });
  },

  async unpublish(id: string): Promise<Community> {
    return communityService.update(id, { is_published: false });
  },

  async uploadHeroImage(id: string, file: File): Promise<{ url: string }> {
    const ext = file.name.split('.').pop();
    const path = `communities/${id}/hero-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('community-media')
      .upload(path, file, { upsert: true });
    if (error) throw new Error(error.message);
    const { data: urlData } = supabase.storage
      .from('community-media')
      .getPublicUrl(data.path);
    return { url: urlData.publicUrl };
  },
};

// ============ COMMUNITY CONTENT ============
export const communityContentService = {
  async getByCommunity(communityId: string): Promise<CommunityContent[]> {
    const { data, error } = await supabase
      .from('community_content')
      .select('*')
      .eq('community_id', communityId)
      .order('sort_order', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as CommunityContent[];
  },

  async create(communityId: string, contentData: Partial<CommunityContent>): Promise<CommunityContent> {
    const { data, error } = await supabase
      .from('community_content')
      .insert([{ ...contentData, community_id: communityId } as any])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as CommunityContent;
  },

  async update(
    communityId: string,
    contentId: string,
    contentData: Partial<CommunityContent>
  ): Promise<CommunityContent> {
    const { data, error } = await supabase
      .from('community_content')
      .update(contentData as any)
      .eq('id', contentId)
      .eq('community_id', communityId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as CommunityContent;
  },

  async delete(communityId: string, contentId: string): Promise<void> {
    const { error } = await supabase
      .from('community_content')
      .delete()
      .eq('id', contentId)
      .eq('community_id', communityId);
    if (error) throw new Error(error.message);
  },

  async uploadMedia(communityId: string, file: File): Promise<{ url: string; type: string }> {
    const ext = file.name.split('.').pop();
    const path = `communities/${communityId}/media-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('community-media')
      .upload(path, file, { upsert: true });
    if (error) throw new Error(error.message);
    const { data: urlData } = supabase.storage
      .from('community-media')
      .getPublicUrl(data.path);
    const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image';
    return { url: urlData.publicUrl, type };
  },
};

// ============ COMMUNITY EVENTS ============
export const communityEventService = {
  async getByCommunity(communityId: string): Promise<CommunityEvent[]> {
    const { data, error } = await supabase
      .from('community_events')
      .select('*')
      .eq('community_id', communityId)
      .order('start_date', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as CommunityEvent[];
  },

  async getAll(page = 1, limit = 50): Promise<PaginatedResponse<CommunityEvent>> {
    const from = (page - 1) * limit;
    const { data, count, error } = await supabase
      .from('community_events')
      .select('*', { count: 'exact' })
      .order('start_date', { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw new Error(error.message);
    return paginate(data as unknown as CommunityEvent[], count, page, limit);
  },

  async getById(id: string): Promise<CommunityEvent> {
    const { data, error } = await supabase
      .from('community_events')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as CommunityEvent;
  },

  async create(eventData: Partial<CommunityEvent>): Promise<CommunityEvent> {
    const { data, error } = await supabase
      .from('community_events')
      .insert([eventData as any])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as CommunityEvent;
  },

  async update(id: string, eventData: Partial<CommunityEvent>): Promise<CommunityEvent> {
    const { data, error } = await supabase
      .from('community_events')
      .update(eventData as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as CommunityEvent;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('community_events').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async publish(id: string): Promise<CommunityEvent> {
    return communityEventService.update(id, { is_published: true });
  },

  async getInvitations(eventId: string) {
    const { data, error } = await supabase
      .from('event_invitations')
      .select('*')
      .eq('event_id', eventId);
    if (error) return [];
    return data ?? [];
  },

  async respondToInvitation(invitationId: string, status: 'approved' | 'declined' | 'waitlisted') {
    const { error } = await supabase
      .from('event_invitations')
      .update({ status } as any)
      .eq('id', invitationId);
    if (error) throw new Error(error.message);
  },
};

// ============ EXPERIENCES ============
export const experienceService = {
  async getAll(
    page = 1,
    limit = 50,
    filters?: Record<string, any>
  ): Promise<PaginatedResponse<Experience>> {
    const from = (page - 1) * limit;
    let query = supabase
      .from('experiences')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.status === 'published') query = query.eq('is_published', true);
    if (filters?.status === 'draft') query = query.eq('is_published', false);
    if (filters?.featured !== undefined) query = query.eq('is_featured', filters.featured);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);
    return paginate(data as unknown as Experience[], count, page, limit);
  },

  async getById(id: string): Promise<Experience> {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as Experience;
  },

  async create(experienceData: Partial<Experience>): Promise<Experience> {
    const { data, error } = await supabase
      .from('experiences')
      .insert([experienceData as any])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as Experience;
  },

  async update(id: string, experienceData: Partial<Experience>): Promise<Experience> {
    const { data, error } = await supabase
      .from('experiences')
      .update(experienceData as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as Experience;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async publish(id: string): Promise<Experience> {
    return experienceService.update(id, { is_published: true });
  },

  async feature(id: string): Promise<Experience> {
    return experienceService.update(id, { is_featured: true });
  },

  async uploadCoverImage(id: string, file: File): Promise<{ url: string }> {
    const ext = file.name.split('.').pop();
    const path = `experiences/${id}/cover-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('community-media')
      .upload(path, file, { upsert: true });
    if (error) throw new Error(error.message);
    const { data: urlData } = supabase.storage
      .from('community-media')
      .getPublicUrl(data.path);
    return { url: urlData.publicUrl };
  },

  async uploadGalleryImages(id: string, files: File[]): Promise<{ urls: string[] }> {
    const urls: string[] = [];
    for (const file of files) {
      const { url } = await experienceService.uploadCoverImage(id, file);
      urls.push(url);
    }
    return { urls };
  },

  async getBookings(id: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('experience_bookings')
      .select('*')
      .eq('experience_id', id)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data ?? []) as unknown as Booking[];
  },
};

// ============ GUIDES ============
export const guideService = {
  async getAll(
    page = 1,
    limit = 50,
    filters?: Record<string, any>
  ): Promise<PaginatedResponse<Guide>> {
    const from = (page - 1) * limit;
    let query = supabase
      .from('guides')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (filters?.verified !== undefined) query = query.eq('is_verified', filters.verified);
    if (filters?.county) query = query.eq('county', filters.county);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);
    return paginate(data as unknown as Guide[], count, page, limit);
  },

  async getById(id: string): Promise<Guide> {
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as Guide;
  },

  async update(id: string, guideData: Partial<Guide>): Promise<Guide> {
    const { data, error } = await supabase
      .from('guides')
      .update(guideData as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as Guide;
  },

  async verify(id: string): Promise<Guide> {
    return guideService.update(id, { is_verified: true });
  },

  async publish(id: string): Promise<Guide> {
    return guideService.update(id, { is_published: true });
  },

  async getBookings(id: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('guide_bookings')
      .select('*')
      .eq('guide_id', id)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data ?? []) as unknown as Booking[];
  },

  async getReviews(id: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('guide_reviews')
      .select('*')
      .eq('guide_id', id)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data ?? []) as unknown as Review[];
  },
};

// ============ BOOKINGS ============
export const bookingService = {
  async getAll(
    type?: string,
    page = 1,
    limit = 50,
    filters?: Record<string, any>
  ): Promise<PaginatedResponse<Booking>> {
    const from = (page - 1) * limit;
    let query = supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (type) query = query.eq('booking_type', type);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);
    return paginate(data as unknown as Booking[], count, page, limit);
  },

  async getById(id: string): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as Booking;
  },

  async updateStatus(id: string, status: string): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as Booking;
  },

  async cancel(id: string): Promise<void> {
    await bookingService.updateStatus(id, 'cancelled');
  },

  async sendNotification(_id: string, _message: string): Promise<void> {
    // Notifications would be handled via Supabase edge functions or email service
  },
};

// ============ REVIEWS ============
export const reviewService = {
  async getAll(
    entityType?: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedResponse<Review>> {
    const from = (page - 1) * limit;
    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (entityType) query = query.eq('entity_type', entityType);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);
    return paginate(data as unknown as Review[], count, page, limit);
  },

  async approve(id: string): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .update({ is_approved: true } as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as Review;
  },

  async reject(id: string): Promise<void> {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async respondToReview(_id: string, _response: string): Promise<void> {
    // Response functionality depends on your reviews table schema
  },
};

// ============ DASHBOARD ============
export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const [
      { count: bookingCount },
      { data: revenueData },
      { count: communityCount },
      { count: experienceCount },
      { count: guideCount },
      { data: ratingData },
    ] = await Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('total_price'),
      supabase.from('communities').select('*', { count: 'exact', head: true }),
      supabase.from('experiences').select('*', { count: 'exact', head: true }),
      supabase.from('guides').select('*', { count: 'exact', head: true }),
      supabase.from('experiences').select('rating').not('rating', 'is', null),
    ]);

    const totalRevenue = (revenueData ?? []).reduce(
      (sum, b) => sum + ((b as any).total_price ?? 0),
      0
    );
    const ratings = (ratingData ?? []).map((r) => (r as any).rating).filter(Boolean);
    const averageRating = ratings.length
      ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      : 0;

    const recentActivity = await dashboardService.getRecentActivity(10);

    return {
      totalBookings: bookingCount ?? 0,
      totalRevenue,
      totalUsers: 0,
      activeListings: (communityCount ?? 0) + (experienceCount ?? 0) + (guideCount ?? 0),
      pendingApprovals: 0,
      communityCount: communityCount ?? 0,
      experienceCount: experienceCount ?? 0,
      guideCount: guideCount ?? 0,
      averageRating,
      recentActivity,
    };
  },

  async getRecentActivity(limit = 20): Promise<any[]> {
    const { data } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data ?? [];
  },

  async getAnalytics(_period: 'week' | 'month' | 'year' = 'month'): Promise<any> {
    return {};
  },
};

// ============ UTILITIES ============
export const adminService = {
  async uploadFile(file: File, path: string): Promise<{ url: string }> {
    const fullPath = `${path}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('community-media')
      .upload(fullPath, file, { upsert: true });
    if (error) throw new Error(error.message);
    const { data: urlData } = supabase.storage
      .from('community-media')
      .getPublicUrl(data.path);
    return { url: urlData.publicUrl };
  },

  async exportData(dataType: string): Promise<Blob> {
    const { data, error } = await supabase.from(dataType as any).select('*');
    if (error) throw new Error(error.message);
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  },
};
