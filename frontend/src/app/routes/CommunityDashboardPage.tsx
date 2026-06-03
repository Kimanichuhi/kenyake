import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Calendar, DollarSign, Eye, Loader2, MapPin,
  MessageCircle, Shield, Star, TrendingUp, Users, Building2,
  Image, FileText
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';

interface CommunityStats {
  totalVisitors: number;
  totalRevenue: number;
  totalEvents: number;
  totalExperiences: number;
  avgRating: number;
  reviewCount: number;
}

interface CommunityData {
  id: string;
  name: string;
  county: string;
  slug: string;
  current_visitor_count: number;
  max_daily_visitors: number;
}

export default function CommunityDashboardPage() {
  const { user } = useAuth();
  const { isCommunityAdmin, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<CommunityData | null>(null);
  const [stats, setStats] = useState<CommunityStats>({
    totalVisitors: 0, totalRevenue: 0, totalEvents: 0,
    totalExperiences: 0, avgRating: 0, reviewCount: 0,
  });
  const [events, setEvents] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !rolesLoading) fetchData();
  }, [user, rolesLoading]);

  const fetchData = async () => {
    // Find community managed by this user
    const { data: communityData } = await supabase
      .from('communities')
      .select('*')
      .eq('managed_by', user!.id)
      .maybeSingle();

    if (communityData) {
      setCommunity(communityData as CommunityData);

      // Fetch events
      const { data: eventsData } = await supabase
        .from('community_events')
        .select('*')
        .eq('community_id', communityData.id)
        .order('start_date', { ascending: false })
        .limit(10);
      setEvents(eventsData || []);

      // Fetch experiences count
      const { count: expCount } = await supabase
        .from('experiences')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityData.id);

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('community_review_responses')
        .select('*')
        .eq('community_id', communityData.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setReviews(reviewsData || []);

      // Fetch impact report
      const { data: impactData } = await supabase
        .from('community_impact_reports')
        .select('*')
        .eq('community_id', communityData.id)
        .order('year', { ascending: false })
        .limit(1)
        .maybeSingle();

      setStats({
        totalVisitors: impactData?.total_visitors || communityData.current_visitor_count || 0,
        totalRevenue: impactData?.total_revenue_kes || 0,
        totalEvents: eventsData?.length || 0,
        totalExperiences: expCount || 0,
        avgRating: reviewsData?.length ? reviewsData.reduce((s: number, r: any) => s + (r.review_rating || 0), 0) / reviewsData.length : 0,
        reviewCount: reviewsData?.length || 0,
      });
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center container mx-auto px-4">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
          <Button onClick={() => navigate('/auth')} className="rounded-full">Sign In</Button>
        </div>
        <FooterSection />
      </div>
    );
  }

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center container mx-auto px-4">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">No Community Found</h1>
          <p className="text-muted-foreground mb-6">You're not currently managing any community.</p>
        </div>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-7 w-7 text-primary" />
              <h1 className="font-serif text-3xl font-bold text-foreground">{community.name}</h1>
              <Badge variant="outline">{community.county}</Badge>
            </div>
            <p className="text-muted-foreground mb-8">Community Management Dashboard</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Visitors', value: stats.totalVisitors.toLocaleString(), icon: Users, color: 'text-primary' },
              { label: 'Revenue (KES)', value: `${(stats.totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-accent' },
              { label: 'Events', value: stats.totalEvents, icon: Calendar, color: 'text-secondary' },
              { label: 'Avg Rating', value: stats.avgRating.toFixed(1), icon: Star, color: 'text-secondary' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <Icon className={`h-5 w-5 ${color} mb-2`} />
                  <div className="text-2xl font-serif font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="visitors">Visitors</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" /> Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Experiences offered</span>
                      <span className="font-bold">{stats.totalExperiences}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current visitors</span>
                      <span className="font-bold">{community.current_visitor_count || 0} / {community.max_daily_visitors || '∞'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Review count</span>
                      <span className="font-bold">{stats.reviewCount}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" /> Upcoming Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {events.filter(e => new Date(e.start_date) >= new Date()).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No upcoming events</p>
                    ) : (
                      <div className="space-y-2">
                        {events.filter(e => new Date(e.start_date) >= new Date()).slice(0, 5).map((event: any) => (
                          <div key={event.id} className="flex justify-between items-center p-2 rounded border border-border">
                            <div>
                              <p className="text-sm font-medium">{event.title}</p>
                              <p className="text-xs text-muted-foreground">{new Date(event.start_date).toLocaleDateString()}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">{event.event_type}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="events">
              <Card>
                <CardContent className="p-6">
                  {events.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No events found</p>
                  ) : (
                    <div className="space-y-3">
                      {events.map((event: any) => (
                        <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.start_date).toLocaleDateString()} · {event.location_name || event.county}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={event.is_past ? 'secondary' : 'default'} className="text-xs">
                              {event.is_past ? 'Past' : 'Upcoming'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {event.current_attendees || 0}/{event.max_attendees || '∞'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardContent className="p-6">
                  {reviews.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No reviews yet</p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="p-4 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{review.reviewer_name}</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-secondary text-secondary" />
                              <span className="text-sm">{review.review_rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.review_text}</p>
                          {review.response_text && (
                            <div className="mt-2 pl-3 border-l-2 border-primary">
                              <p className="text-xs text-muted-foreground italic">{review.response_text}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visitors">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <Eye className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Visitor flow data will appear as bookings are made</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 max-w-sm mx-auto">
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="text-lg font-bold">{community.current_visitor_count || 0}</div>
                        <div className="text-xs text-muted-foreground">Current visitors</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="text-lg font-bold">{community.max_daily_visitors || '∞'}</div>
                        <div className="text-xs text-muted-foreground">Max daily capacity</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
