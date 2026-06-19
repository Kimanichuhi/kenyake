import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  communityService,
  communityContentService,
  communityEventService,
  experienceService,
  guideService,
  bookingService,
  reviewService,
  dashboardService,
} from '../services/api';
import type {
  Community,
  CommunityContent,
  CommunityEvent,
  Experience,
  Guide,
  Booking,
  Review,
  DashboardMetrics,
} from '../types';

// Query Keys
const QUERY_KEYS = {
  communities: {
    all: ['communities'],
    list: (page: number, limit: number) => ['communities', 'list', page, limit],
    detail: (id: string) => ['communities', id],
    content: (id: string) => ['communities', id, 'content'],
    events: (id: string) => ['communities', id, 'events'],
  },
  experiences: {
    all: ['experiences'],
    list: (page: number, limit: number, filters?: Record<string, any>) => [
      'experiences',
      'list',
      page,
      limit,
      filters,
    ],
    detail: (id: string) => ['experiences', id],
    bookings: (id: string) => ['experiences', id, 'bookings'],
  },
  guides: {
    all: ['guides'],
    list: (page: number, limit: number, filters?: Record<string, any>) => [
      'guides',
      'list',
      page,
      limit,
      filters,
    ],
    detail: (id: string) => ['guides', id],
    bookings: (id: string) => ['guides', id, 'bookings'],
    reviews: (id: string) => ['guides', id, 'reviews'],
  },
  bookings: {
    all: ['bookings'],
    list: (type?: string, page?: number, limit?: number, filters?: Record<string, any>) => [
      'bookings',
      'list',
      type,
      page,
      limit,
      filters,
    ],
    detail: (id: string) => ['bookings', id],
  },
  reviews: {
    all: ['reviews'],
    list: (entityType?: string, page?: number, limit?: number) => [
      'reviews',
      'list',
      entityType,
      page,
      limit,
    ],
  },
  dashboard: {
    metrics: ['dashboard', 'metrics'],
    activity: ['dashboard', 'activity'],
    analytics: (period: string) => ['dashboard', 'analytics', period],
  },
};

// ============ COMMUNITIES HOOKS ============
export const useCommunities = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: QUERY_KEYS.communities.list(page, limit),
    queryFn: () => communityService.getAll(page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCommunity = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.communities.detail(id),
    queryFn: () => communityService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Community>) => communityService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communities.all });
    },
  });
};

export const useUpdateCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Community> }) =>
      communityService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communities.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communities.all });
    },
  });
};

export const useDeleteCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communityService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communities.all });
    },
  });
};

export const usePublishCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communityService.publish(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communities.detail(data.id) });
    },
  });
};

export const useUploadHeroImage = () => {
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      communityService.uploadHeroImage(id, file),
  });
};

// ============ COMMUNITY CONTENT HOOKS ============
export const useCommunityContent = (communityId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.communities.content(communityId),
    queryFn: () => communityContentService.getByCommunity(communityId),
    enabled: !!communityId,
  });
};

export const useCreateCommunityContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      communityId,
      data,
    }: {
      communityId: string;
      data: Partial<CommunityContent>;
    }) => communityContentService.create(communityId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.communities.content(variables.communityId),
      });
    },
  });
};

export const useUpdateCommunityContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      communityId,
      contentId,
      data,
    }: {
      communityId: string;
      contentId: string;
      data: Partial<CommunityContent>;
    }) => communityContentService.update(communityId, contentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.communities.content(variables.communityId),
      });
    },
  });
};

export const useDeleteCommunityContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, contentId }: { communityId: string; contentId: string }) =>
      communityContentService.delete(communityId, contentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.communities.content(variables.communityId),
      });
    },
  });
};

export const useUploadCommunityMedia = () => {
  return useMutation({
    mutationFn: ({ communityId, file }: { communityId: string; file: File }) =>
      communityContentService.uploadMedia(communityId, file),
  });
};

// ============ EVENTS HOOKS ============
export const useCommunityEvents = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: QUERY_KEYS.communities.events(['all', page, limit]),
    queryFn: () => communityEventService.getAll(page, limit),
  });
};

export const useCommunityEvent = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.communities.detail(id),
    queryFn: () => communityEventService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCommunityEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CommunityEvent>) => communityEventService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateCommunityEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CommunityEvent> }) =>
      communityEventService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// ============ EXPERIENCES HOOKS ============
export const useExperiences = (page = 1, limit = 50, filters?: Record<string, any>) => {
  return useQuery({
    queryKey: QUERY_KEYS.experiences.list(page, limit, filters),
    queryFn: () => experienceService.getAll(page, limit, filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useExperience = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.experiences.detail(id),
    queryFn: () => experienceService.getById(id),
    enabled: !!id,
  });
};

export const useCreateExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Experience>) => experienceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.experiences.all });
    },
  });
};

export const useUpdateExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Experience> }) =>
      experienceService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.experiences.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.experiences.all });
    },
  });
};

export const useDeleteExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => experienceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.experiences.all });
    },
  });
};

export const usePublishExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => experienceService.publish(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.experiences.detail(data.id) });
    },
  });
};

export const useFeatureExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => experienceService.feature(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.experiences.detail(data.id) });
    },
  });
};

// ============ GUIDES HOOKS ============
export const useGuides = (page = 1, limit = 50, filters?: Record<string, any>) => {
  return useQuery({
    queryKey: QUERY_KEYS.guides.list(page, limit, filters),
    queryFn: () => guideService.getAll(page, limit, filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGuide = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.guides.detail(id),
    queryFn: () => guideService.getById(id),
    enabled: !!id,
  });
};

export const useUpdateGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Guide> }) =>
      guideService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guides.detail(data.id) });
    },
  });
};

export const useVerifyGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guideService.verify(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guides.detail(data.id) });
    },
  });
};

// ============ BOOKINGS HOOKS ============
export const useBookings = (
  type?: string,
  page = 1,
  limit = 50,
  filters?: Record<string, any>
) => {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.list(type, page, limit, filters),
    queryFn: () => bookingService.getAll(type, page, limit, filters),
    staleTime: 1000 * 60 * 2,
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.detail(id),
    queryFn: () => bookingService.getById(id),
    enabled: !!id,
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      bookingService.updateStatus(id, status, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all });
    },
  });
};

// ============ REVIEWS HOOKS ============
export const useReviews = (entityType?: string, page = 1, limit = 50) => {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.list(entityType, page, limit),
    queryFn: () => reviewService.getAll(entityType, page, limit),
    staleTime: 1000 * 60 * 5,
  });
};

export const useApproveReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews.all });
    },
  });
};

export const useRejectReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      reviewService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews.all });
    },
  });
};

// ============ DASHBOARD HOOKS ============
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.metrics,
    queryFn: () => dashboardService.getMetrics(),
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useDashboardActivity = (limit = 20) => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.activity,
    queryFn: () => dashboardService.getRecentActivity(limit),
    staleTime: 1000 * 60,
  });
};

export const useDashboardAnalytics = (period: 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.analytics(period),
    queryFn: () => dashboardService.getAnalytics(period),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
