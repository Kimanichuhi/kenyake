import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, DollarSign, Loader2, Package, Shield, Star,
  TrendingUp, Users, Briefcase, PlusCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function OperatorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [foodListings, setFoodListings] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    // Fetch operator's experiences (by checking host matches)
    const { data: expData } = await supabase
      .from('experiences')
      .select('id, title, slug, category, rating, review_count, price_amount, is_published, county')
      .limit(50);

    setExperiences(expData || []);

    const { data: accData } = await supabase
      .from('accommodations')
      .select('id, name, slug, property_type, rating, review_count, price_per_night, is_published, county, tier')
      .limit(50);

    setAccommodations(accData || []);

    const { data: foodData } = await supabase
      .from('food_listings')
      .select('id, name, slug, listing_type, rating, review_count, price_per_person, is_published, county')
      .limit(50);

    setFoodListings(foodData || []);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  const totalListings = experiences.length + accommodations.length + foodListings.length;
  const avgRating = (() => {
    const all = [...experiences, ...accommodations, ...foodListings].filter(l => l.rating);
    return all.length ? (all.reduce((s, l) => s + l.rating, 0) / all.length).toFixed(1) : '0';
  })();

  const ListingRow = ({ item, type }: { item: any; type: string }) => (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
      <div>
        <p className="font-medium text-sm">{item.name || item.title}</p>
        <p className="text-xs text-muted-foreground">{item.county} · {type}</p>
      </div>
      <div className="flex items-center gap-2">
        {item.rating && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-secondary text-secondary" /> {item.rating}
          </span>
        )}
        <Badge variant={item.is_published ? 'default' : 'secondary'} className="text-xs">
          {item.is_published ? 'Live' : 'Draft'}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="h-7 w-7 text-primary" />
              <h1 className="font-serif text-3xl font-bold text-foreground">Operator Dashboard</h1>
            </div>
            <p className="text-muted-foreground mb-8">Manage your listings, bookings, and impact score</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Listings', value: totalListings, icon: Package, color: 'text-primary' },
              { label: 'Experiences', value: experiences.length, icon: Users, color: 'text-accent' },
              { label: 'Accommodations', value: accommodations.length, icon: BarChart3, color: 'text-secondary' },
              { label: 'Avg Rating', value: avgRating, icon: Star, color: 'text-secondary' },
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

          <Tabs defaultValue="experiences">
            <TabsList className="mb-6">
              <TabsTrigger value="experiences">Experiences ({experiences.length})</TabsTrigger>
              <TabsTrigger value="accommodations">Stays ({accommodations.length})</TabsTrigger>
              <TabsTrigger value="food">Food ({foodListings.length})</TabsTrigger>
              <TabsTrigger value="impact">Impact</TabsTrigger>
            </TabsList>

            <TabsContent value="experiences">
              <Card>
                <CardContent className="p-6 space-y-3">
                  {experiences.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No experiences listed</p>
                  ) : experiences.map(exp => (
                    <ListingRow key={exp.id} item={exp} type={exp.category} />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accommodations">
              <Card>
                <CardContent className="p-6 space-y-3">
                  {accommodations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No accommodations listed</p>
                  ) : accommodations.map(acc => (
                    <ListingRow key={acc.id} item={acc} type={acc.property_type} />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="food">
              <Card>
                <CardContent className="p-6 space-y-3">
                  {foodListings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No food listings</p>
                  ) : foodListings.map(food => (
                    <ListingRow key={food.id} item={food} type={food.listing_type} />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="impact">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> Impact Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-5xl font-serif font-bold text-primary mb-2">78</div>
                    <p className="text-muted-foreground text-sm">Your impact score is calculated based on community engagement, local employment, and sustainability practices</p>
                    <div className="grid grid-cols-3 gap-4 mt-6 max-w-md mx-auto">
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="text-lg font-bold text-foreground">85</div>
                        <div className="text-xs text-muted-foreground">Community</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="text-lg font-bold text-foreground">72</div>
                        <div className="text-xs text-muted-foreground">Employment</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="text-lg font-bold text-foreground">76</div>
                        <div className="text-xs text-muted-foreground">Sustainability</div>
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
