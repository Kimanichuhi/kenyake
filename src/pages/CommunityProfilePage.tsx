import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, MapPin, Shield, BookOpen, Shirt, Globe, Mountain,
  Camera, Video, Mic, CheckCircle, XCircle, MessageSquare,
  Star, Phone, Mail, Clock, ChevronLeft, Leaf, Crown, AlertTriangle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { supabase } from "@/integrations/supabase/client";

import expBeadwork from "@/assets/exp-beadwork.jpg";
import communityMarket from "@/assets/community-market.jpg";
import expCooking from "@/assets/exp-cooking.jpg";
import culturalCeremony from "@/assets/cultural-ceremony.jpg";

const imageMap: Record<string, string> = {
  "/exp-beadwork.jpg": expBeadwork,
  "/community-market.jpg": communityMarket,
  "/exp-cooking.jpg": expCooking,
};

type Community = {
  id: string; slug: string; name: string; county: string; region: string | null;
  hero_image: string | null; description: string | null; origin_story: string | null;
  history: string | null; population: number | null; established_year: string | null;
  specialty: string | null; traditional_dress: string | null; adornment_explanation: string | null;
  leader_name: string | null; leader_title: string | null; contact_email: string | null;
  contact_phone: string | null; max_daily_visitors: number | null; current_visitor_count: number | null;
  visitor_guidelines: string | null; ecological_knowledge: string | null;
  lat: number | null; lng: number | null;
};

type ContentItem = {
  id: string; content_type: string; title: string; body: string | null;
  media_url: string | null; media_type: string | null; metadata: Record<string, any> | null;
};

type ReviewResponse = {
  id: string; reviewer_name: string; review_text: string; review_rating: number | null;
  review_date: string | null; response_text: string | null;
};

const CommunityProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: community, isLoading } = useQuery({
    queryKey: ["community", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("slug", slug!)
        .single();
      if (error) throw error;
      return data as Community;
    },
    enabled: !!slug,
  });

  const { data: content = [] } = useQuery({
    queryKey: ["community-content", community?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_content")
        .select("*")
        .eq("community_id", community!.id)
        .order("sort_order");
      if (error) throw error;
      return data as ContentItem[];
    },
    enabled: !!community?.id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["community-reviews", community?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_review_responses")
        .select("*")
        .eq("community_id", community!.id)
        .order("review_date", { ascending: false });
      if (error) throw error;
      return data as ReviewResponse[];
    },
    enabled: !!community?.id,
  });

  const { data: gallery = [] } = useQuery({
    queryKey: ["community-gallery", community?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_gallery")
        .select("*")
        .eq("community_id", community!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!community?.id,
  });

  const practices = content.filter(c => c.content_type === "cultural_practice");
  const phrases = content.filter(c => c.content_type === "phrase");
  const sacredSites = content.filter(c => c.content_type === "sacred_site");
  const dosDonts = content.filter(c => c.content_type === "dos_donts");
  const oralHistories = content.filter(c => c.content_type === "oral_history");

  const dos = dosDonts.filter(d => (d.metadata as any)?.type === "do");
  const donts = dosDonts.filter(d => (d.metadata as any)?.type === "dont");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-muted-foreground font-body">Loading community profile...</div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground font-body">Community not found</p>
          <Link to="/community" className="gradient-safari text-primary-foreground rounded-full px-6 py-2 text-sm font-body">
            ← Back to Communities
          </Link>
        </div>
      </div>
    );
  }

  const heroImg = community.hero_image ? imageMap[community.hero_image] || culturalCeremony : culturalCeremony;
  const capacityPct = community.max_daily_visitors
    ? Math.round(((community.current_visitor_count || 0) / community.max_daily_visitors) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20">
        <div className="relative h-[50vh] overflow-hidden">
          <img src={heroImg} alt={community.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsla(30,10%,10%,0.2) 0%, hsla(30,10%,10%,0.85) 100%)" }} />
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-10">
              <Link to="/community" className="inline-flex items-center gap-1 text-primary-foreground/70 text-sm font-body mb-4 hover:text-primary-foreground transition-colors">
                <ChevronLeft className="h-4 w-4" /> All Communities
              </Link>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <Badge variant="secondary" className="gradient-safari text-primary-foreground border-0">
                    <MapPin className="h-3 w-3 mr-1" />{community.county}
                  </Badge>
                  {community.established_year && (
                    <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/80">
                      Est. {community.established_year}
                    </Badge>
                  )}
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-2">{community.name}</h1>
                <p className="text-primary-foreground/70 font-body max-w-2xl text-lg">{community.description}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {community.population && (
              <div className="text-center">
                <Users className="h-5 w-5 mx-auto text-safari-green mb-1" />
                <div className="font-display text-lg font-bold text-foreground">{community.population.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground font-body">Population</p>
              </div>
            )}
            <div className="text-center">
              <Globe className="h-5 w-5 mx-auto text-river-blue mb-1" />
              <div className="font-display text-lg font-bold text-foreground">{community.region || community.county}</div>
              <p className="text-xs text-muted-foreground font-body">Region</p>
            </div>
            <div className="text-center">
              <BookOpen className="h-5 w-5 mx-auto text-sunset-orange mb-1" />
              <div className="font-display text-lg font-bold text-foreground">{practices.length}</div>
              <p className="text-xs text-muted-foreground font-body">Cultural Practices</p>
            </div>
            <div className="text-center">
              <Shield className="h-5 w-5 mx-auto text-savannah-gold mb-1" />
              <div className="font-display text-lg font-bold text-foreground">{sacredSites.length}</div>
              <p className="text-xs text-muted-foreground font-body">Sacred Sites</p>
            </div>
            <div className="text-center">
              <AlertTriangle className="h-5 w-5 mx-auto text-accent mb-1" />
              <div className="font-display text-lg font-bold text-foreground">{community.max_daily_visitors}</div>
              <p className="text-xs text-muted-foreground font-body">Max Daily Visitors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visitor Capacity Banner */}
      <section className="py-4 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-body text-foreground font-medium">Today's Visitor Capacity</span>
                <span className="text-sm font-body text-muted-foreground">{community.current_visitor_count || 0}/{community.max_daily_visitors} visitors</span>
              </div>
              <Progress value={capacityPct} className="h-2" />
            </div>
            <Badge variant={capacityPct >= 80 ? "destructive" : "secondary"} className="text-xs">
              {capacityPct >= 100 ? "Full — Try Tomorrow" : capacityPct >= 80 ? "Almost Full" : "Accepting Visitors"}
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger value="history" className="text-xs font-body">📜 History</TabsTrigger>
              <TabsTrigger value="culture" className="text-xs font-body">🎭 Culture</TabsTrigger>
              <TabsTrigger value="dress" className="text-xs font-body">👗 Dress</TabsTrigger>
              <TabsTrigger value="language" className="text-xs font-body">🗣️ Language</TabsTrigger>
              <TabsTrigger value="sacred" className="text-xs font-body">⛰️ Sacred Sites</TabsTrigger>
              <TabsTrigger value="guidelines" className="text-xs font-body">📋 Visitor Guide</TabsTrigger>
              <TabsTrigger value="stories" className="text-xs font-body">🎙️ Oral History</TabsTrigger>
              <TabsTrigger value="ecology" className="text-xs font-body">🌿 Ecology</TabsTrigger>
              <TabsTrigger value="gallery" className="text-xs font-body">📸 Gallery</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs font-body">💬 Reviews</TabsTrigger>
              <TabsTrigger value="contact" className="text-xs font-body">📞 Contact</TabsTrigger>
            </TabsList>

            {/* History & Origin */}
            <TabsContent value="history">
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-4">Origin Story</h2>
                    <p className="text-muted-foreground font-body leading-relaxed">{community.origin_story}</p>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-4">Our History</h2>
                    <p className="text-muted-foreground font-body leading-relaxed">{community.history}</p>
                  </div>
                </motion.div>
              </div>
            </TabsContent>

            {/* Cultural Practices */}
            <TabsContent value="culture">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Cultural Practices & Traditions</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {practices.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                    <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl gradient-sunset mb-3">
                      <BookOpen className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground font-body mb-3">{p.body}</p>
                    {p.metadata && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(p.metadata as Record<string, string>).map(([k, v]) => (
                          <Badge key={k} variant="outline" className="text-xs capitalize">
                            {k.replace(/_/g, " ")}: {v}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              {practices.length === 0 && <p className="text-muted-foreground font-body text-center py-8">Cultural practices coming soon...</p>}
            </TabsContent>

            {/* Traditional Dress */}
            <TabsContent value="dress">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Shirt className="h-6 w-6 text-sunset-orange" />
                    <h2 className="font-display text-2xl font-bold text-foreground">Traditional Dress</h2>
                  </div>
                  <p className="text-muted-foreground font-body leading-relaxed mb-6">{community.traditional_dress || "Information coming soon..."}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-6 w-6 text-savannah-gold" />
                    <h2 className="font-display text-2xl font-bold text-foreground">Adornment & Jewelry</h2>
                  </div>
                  <p className="text-muted-foreground font-body leading-relaxed">{community.adornment_explanation || "Information coming soon..."}</p>
                </div>
              </div>
            </TabsContent>

            {/* Language */}
            <TabsContent value="language">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Language Basics — Greetings & Phrases</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {phrases.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
                    <h3 className="font-display text-xl font-bold text-foreground mb-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground font-body mb-2">{p.body}</p>
                    {p.metadata && (
                      <div className="space-y-1">
                        {(p.metadata as any).pronunciation && (
                          <p className="text-xs font-body"><span className="text-sunset-orange font-medium">🔊 Pronunciation:</span> {(p.metadata as any).pronunciation}</p>
                        )}
                        {(p.metadata as any).usage && (
                          <p className="text-xs font-body text-muted-foreground"><span className="font-medium">Usage:</span> {(p.metadata as any).usage}</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              {phrases.length === 0 && <p className="text-muted-foreground font-body text-center py-8">Language guide coming soon...</p>}
            </TabsContent>

            {/* Sacred Sites */}
            <TabsContent value="sacred">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Sacred Sites & Etiquette</h2>
              <p className="text-muted-foreground font-body mb-6">These are places of deep spiritual significance. Please observe all etiquette guidelines with the utmost respect.</p>
              <div className="space-y-6">
                {sacredSites.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 border-l-4 border-l-savannah-gold">
                    <div className="flex items-start gap-3">
                      <Mountain className="h-6 w-6 text-savannah-gold mt-1 shrink-0" />
                      <div>
                        <h3 className="font-display text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                        <p className="text-sm text-muted-foreground font-body mb-3">{s.body}</p>
                        {s.metadata && (
                          <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                            {(s.metadata as any).etiquette && (
                              <div>
                                <span className="text-xs font-body font-semibold text-destructive flex items-center gap-1"><Shield className="h-3 w-3" /> Etiquette:</span>
                                <p className="text-xs font-body text-muted-foreground mt-1">{(s.metadata as any).etiquette}</p>
                              </div>
                            )}
                            {(s.metadata as any).access && (
                              <div>
                                <span className="text-xs font-body font-semibold text-safari-green flex items-center gap-1"><MapPin className="h-3 w-3" /> Access:</span>
                                <p className="text-xs font-body text-muted-foreground mt-1">{(s.metadata as any).access}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {sacredSites.length === 0 && <p className="text-muted-foreground font-body text-center py-8">Sacred sites information coming soon...</p>}
            </TabsContent>

            {/* Visitor Guide (Do's and Don'ts) */}
            <TabsContent value="guidelines">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Community Visitor Guide</h2>
              <p className="text-sm text-muted-foreground font-body mb-6">Written by the community, for visitors. Please respect these guidelines to ensure a meaningful and respectful visit.</p>

              {community.visitor_guidelines && (
                <div className="glass-card p-5 mb-8 border-l-4 border-l-river-blue">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">General Guidelines</h3>
                  <p className="text-sm text-muted-foreground font-body">{community.visitor_guidelines}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-safari-green" /> Do's
                  </h3>
                  <div className="space-y-3">
                    {dos.map(d => (
                      <div key={d.id} className="glass-card p-4 border-l-4 border-l-safari-green">
                        <h4 className="font-body font-semibold text-foreground text-sm mb-1">{d.title}</h4>
                        <p className="text-xs text-muted-foreground font-body">{d.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" /> Don'ts
                  </h3>
                  <div className="space-y-3">
                    {donts.map(d => (
                      <div key={d.id} className="glass-card p-4 border-l-4 border-l-destructive">
                        <h4 className="font-body font-semibold text-foreground text-sm mb-1">{d.title}</h4>
                        <p className="text-xs text-muted-foreground font-body">{d.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Oral History */}
            <TabsContent value="stories">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Elder Oral History Archive</h2>
              <p className="text-sm text-muted-foreground font-body mb-6">Stories passed down through generations, recorded and preserved with community permission.</p>
              <div className="space-y-6">
                {oralHistories.map((h, i) => (
                  <motion.div key={h.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 h-12 w-12 rounded-full gradient-sunset flex items-center justify-center">
                        <Mic className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-semibold text-foreground mb-1">{h.title}</h3>
                        {h.metadata && (
                          <p className="text-xs text-muted-foreground font-body mb-3">
                            Narrated by <span className="font-semibold text-foreground">{(h.metadata as any).narrator}</span>
                            {(h.metadata as any).age && <>, age {(h.metadata as any).age}</>}
                            {(h.metadata as any).recorded && <> • Recorded {(h.metadata as any).recorded}</>}
                          </p>
                        )}
                        <blockquote className="text-sm text-muted-foreground font-body italic border-l-2 border-savannah-gold pl-4">
                          {h.body}
                        </blockquote>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {oralHistories.length === 0 && <p className="text-muted-foreground font-body text-center py-8">Oral history archive coming soon...</p>}
            </TabsContent>

            {/* Traditional Ecological Knowledge */}
            <TabsContent value="ecology">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-6 w-6 text-acacia-green" />
                <h2 className="font-display text-2xl font-bold text-foreground">Traditional Ecological Knowledge</h2>
              </div>
              <p className="text-sm text-muted-foreground font-body mb-6">Generations of environmental wisdom that predates modern conservation science.</p>
              <div className="glass-card p-6">
                <p className="text-muted-foreground font-body leading-relaxed">{community.ecological_knowledge || "Documentation in progress..."}</p>
              </div>
            </TabsContent>

            {/* Gallery */}
            <TabsContent value="gallery">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="h-6 w-6 text-river-blue" />
                <h2 className="font-display text-2xl font-bold text-foreground">Community Photo Gallery</h2>
              </div>
              {gallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {gallery.map((item: any) => (
                    <div key={item.id} className="aspect-square rounded-xl overflow-hidden">
                      {item.media_type === "video" ? (
                        <video src={item.media_url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.media_url} alt={item.caption || "Community photo"} className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-10 text-center">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground font-body">Community gallery coming soon.</p>
                  <p className="text-xs text-muted-foreground font-body mt-1">Photos are self-uploaded and approved by community managers.</p>
                </div>
              )}
            </TabsContent>

            {/* Reviews & Community Responses */}
            <TabsContent value="reviews">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Visitor Reviews & Community Responses</h2>
              <p className="text-sm text-muted-foreground font-body mb-6">We believe in two-way dialogue. Here's what visitors said and how our community responded.</p>
              <div className="space-y-6">
                {reviews.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card overflow-hidden">
                    {/* Review */}
                    <div className="p-5 border-b border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-body font-semibold text-foreground text-sm">{r.reviewer_name}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: r.review_rating || 0 }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-savannah-gold text-savannah-gold" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground font-body">{r.review_text}</p>
                      {r.review_date && (
                        <p className="text-xs text-muted-foreground/60 font-body mt-2">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(r.review_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      )}
                    </div>
                    {/* Community Response */}
                    {r.response_text && (
                      <div className="p-5 bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-safari-green" />
                          <span className="text-xs font-body font-semibold text-safari-green">Community Response</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-body italic">{r.response_text}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              {reviews.length === 0 && <p className="text-muted-foreground font-body text-center py-8">No reviews yet.</p>}
            </TabsContent>

            {/* Contact & Leadership */}
            <TabsContent value="contact">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Community Leadership & Contact</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-14 w-14 rounded-full gradient-safari flex items-center justify-center">
                      <Crown className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{community.leader_name || "Community Leader"}</h3>
                      <p className="text-sm text-muted-foreground font-body">{community.leader_title || "Community Representative"}</p>
                    </div>
                  </div>
                  <div className="space-y-3 mt-4">
                    {community.contact_email && (
                      <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                        <Mail className="h-4 w-4 text-river-blue" />
                        {community.contact_email}
                      </div>
                    )}
                    {community.contact_phone && (
                      <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                        <Phone className="h-4 w-4 text-safari-green" />
                        {community.contact_phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="glass-card p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3">Visit Information</h3>
                  <div className="space-y-3 text-sm font-body text-muted-foreground">
                    <p><span className="font-semibold text-foreground">Specialty:</span> {community.specialty}</p>
                    <p><span className="font-semibold text-foreground">Max Daily Visitors:</span> {community.max_daily_visitors}</p>
                    <p><span className="font-semibold text-foreground">Region:</span> {community.region || community.county}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default CommunityProfilePage;
