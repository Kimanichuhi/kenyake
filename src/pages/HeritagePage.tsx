import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart, MapPin, Users, BookOpen, Star, Clock, Globe, Search,
  TreePine, UserCircle, Calendar, MessageCircle, Send, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const HeritagePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("homecoming");
  const [forumCategory, setForumCategory] = useState("all");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [visitForm, setVisitForm] = useState({
    family_name: "", region_of_origin: "", purpose: "", preferred_dates: "", group_size: 1, special_requests: ""
  });

  const { data: homecomingPackages } = useQuery({
    queryKey: ["homecoming-packages"],
    queryFn: async () => {
      const { data } = await supabase.from("homecoming_packages").select("*").eq("is_published", true);
      return data || [];
    },
  });

  const { data: genealogyGuides } = useQuery({
    queryKey: ["genealogy-guides"],
    queryFn: async () => {
      const { data } = await supabase.from("genealogy_guides").select("*").eq("is_published", true);
      return data || [];
    },
  });

  const { data: elders } = useQuery({
    queryKey: ["community-elders"],
    queryFn: async () => {
      const { data } = await supabase.from("community_elders").select("*").eq("is_published", true);
      return data || [];
    },
  });

  const { data: programmes } = useQuery({
    queryKey: ["cultural-programmes"],
    queryFn: async () => {
      const { data } = await supabase.from("cultural_programmes").select("*").eq("is_published", true);
      return data || [];
    },
  });

  const { data: forumPosts, refetch: refetchPosts } = useQuery({
    queryKey: ["heritage-forum", forumCategory],
    queryFn: async () => {
      let query = supabase.from("heritage_forum_posts").select("*").order("created_at", { ascending: false });
      if (forumCategory !== "all") query = query.eq("category", forumCategory);
      const { data } = await query;
      return data || [];
    },
  });

  const handleSubmitPost = async () => {
    if (!user) { toast.error("Please sign in to post"); return; }
    if (!newPostTitle.trim() || !newPostBody.trim()) { toast.error("Title and body required"); return; }
    const { error } = await supabase.from("heritage_forum_posts").insert({
      user_id: user.id, title: newPostTitle, body: newPostBody, category: forumCategory === "all" ? "general" : forumCategory
    });
    if (error) toast.error("Failed to post");
    else { toast.success("Post created!"); setNewPostTitle(""); setNewPostBody(""); refetchPosts(); }
  };

  const handleVisitRequest = async () => {
    if (!user) { toast.error("Please sign in to submit a request"); return; }
    const { error } = await supabase.from("ancestral_visit_requests").insert({
      user_id: user.id, ...visitForm
    });
    if (error) toast.error("Failed to submit request");
    else {
      toast.success("Visit request submitted! We'll connect you with the right community.");
      setVisitForm({ family_name: "", region_of_origin: "", purpose: "", preferred_dates: "", group_size: 1, special_requests: "" });
    }
  };

  const forumCategories = [
    { value: "all", label: "All" },
    { value: "genealogy", label: "Genealogy" },
    { value: "homecoming", label: "Homecoming Stories" },
    { value: "language", label: "Language & Culture" },
    { value: "general", label: "General" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30">
              <Heart className="h-3 w-3 mr-1" /> Diaspora & Heritage
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Reconnect with Your <span className="text-secondary">Roots</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Trace your ancestry, meet community elders, and experience your heritage through
              immersive homecoming journeys across Kenya.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container mx-auto px-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-1 h-auto bg-muted/50 p-1 rounded-xl mb-8">
            {[
              { value: "homecoming", icon: Heart, label: "Homecoming Packages" },
              { value: "genealogy", icon: TreePine, label: "Genealogy Guides" },
              { value: "elders", icon: UserCircle, label: "Community Elders" },
              { value: "programmes", icon: BookOpen, label: "Immersion Programmes" },
              { value: "ancestral", icon: MapPin, label: "Ancestral Visits" },
              { value: "forum", icon: MessageCircle, label: "Diaspora Forum" },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Homecoming Packages */}
          <TabsContent value="homecoming">
            <div className="grid md:grid-cols-2 gap-6">
              {homecomingPackages?.map((pkg) => (
                <motion.div key={pkg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-shadow">
                    {pkg.cover_image && (
                      <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${pkg.cover_image})` }} />
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl font-display">{pkg.title}</CardTitle>
                        <Badge variant="secondary" className="whitespace-nowrap">
                          KES {(pkg.price_amount || 0).toLocaleString()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {pkg.duration_days} days</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Up to {pkg.max_guests}</span>
                        {(pkg.rating ?? 0) > 0 && <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-secondary" /> {pkg.rating}</span>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      {pkg.highlights && pkg.highlights.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Highlights</p>
                          <div className="flex flex-wrap gap-1.5">
                            {pkg.highlights.map((h: string) => (
                              <Badge key={h} variant="outline" className="text-xs">{h}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {pkg.includes && pkg.includes.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Includes</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5">
                            {pkg.includes.map((item: string) => (
                              <li key={item} className="flex items-center gap-1"><ChevronRight className="h-3 w-3 text-primary" />{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <Button className="w-full bg-primary text-primary-foreground">Enquire About This Package</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {(!homecomingPackages || homecomingPackages.length === 0) && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Homecoming packages coming soon.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Genealogy Guides */}
          <TabsContent value="genealogy">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {genealogyGuides?.map((guide) => (
                <Card key={guide.id} className="border-border/50">
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <TreePine className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{guide.name}</CardTitle>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {guide.county}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{guide.bio}</p>
                    <div className="flex flex-wrap gap-1">
                      {guide.specialties?.map((s: string) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {guide.languages?.join(", ")}</span>
                      <span className="font-semibold text-foreground">KES {(guide.price_per_session || 0).toLocaleString()}/session</span>
                    </div>
                    <Button variant="outline" className="w-full">Connect with Guide</Button>
                  </CardContent>
                </Card>
              ))}
              {(!genealogyGuides || genealogyGuides.length === 0) && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <TreePine className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Genealogy guides coming soon.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Community Elders */}
          <TabsContent value="elders">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elders?.map((elder) => (
                <Card key={elder.id} className="border-border/50">
                  <CardHeader>
                    <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                      <UserCircle className="h-8 w-8 text-secondary" />
                    </div>
                    <CardTitle className="text-center text-lg">{elder.name}</CardTitle>
                    {elder.title && <p className="text-center text-sm text-secondary font-medium">{elder.title}</p>}
                  </CardHeader>
                  <CardContent className="space-y-3 text-center">
                    <p className="text-sm text-muted-foreground">{elder.bio}</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {elder.expertise?.map((e: string) => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}
                    </div>
                    <p className="text-xs text-muted-foreground"><Calendar className="h-3 w-3 inline mr-1" />{elder.availability}</p>
                    <Button variant="outline" className="w-full">Request Meeting</Button>
                  </CardContent>
                </Card>
              ))}
              {(!elders || elders.length === 0) && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <UserCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Elder profiles coming soon.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Cultural Programmes */}
          <TabsContent value="programmes">
            <div className="grid md:grid-cols-2 gap-6">
              {programmes?.map((prog) => (
                <Card key={prog.id} className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl font-display">{prog.title}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span><Clock className="h-3.5 w-3.5 inline mr-1" />{prog.duration_weeks} weeks</span>
                      <span><Users className="h-3.5 w-3.5 inline mr-1" />Max {prog.max_participants}</span>
                      <Badge variant="secondary">KES {(prog.price_amount || 0).toLocaleString()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{prog.description}</p>
                    <div className="flex gap-2">
                      {prog.accommodation_included && <Badge variant="outline" className="text-xs">🏠 Accommodation</Badge>}
                      {prog.meals_included && <Badge variant="outline" className="text-xs">🍽️ Meals</Badge>}
                    </div>
                    {prog.learning_outcomes && prog.learning_outcomes.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-1">What You'll Learn</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          {prog.learning_outcomes.map((o: string) => (
                            <li key={o} className="flex items-center gap-1"><ChevronRight className="h-3 w-3 text-primary" />{o}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Button className="w-full bg-primary text-primary-foreground">Apply for Programme</Button>
                  </CardContent>
                </Card>
              ))}
              {(!programmes || programmes.length === 0) && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Immersion programmes coming soon.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Ancestral Visit Request */}
          <TabsContent value="ancestral">
            <div className="max-w-2xl mx-auto">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Ancestral Land Visit Request</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Tell us about your roots and we'll coordinate a visit to your ancestral homeland with a local guide and community elders.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Family Name / Clan</label>
                      <Input value={visitForm.family_name} onChange={(e) => setVisitForm({ ...visitForm, family_name: e.target.value })} placeholder="e.g. Mwangi, Ochieng" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Region of Origin</label>
                      <Input value={visitForm.region_of_origin} onChange={(e) => setVisitForm({ ...visitForm, region_of_origin: e.target.value })} placeholder="e.g. Kiambu, Siaya, Meru" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Purpose of Visit</label>
                    <Textarea value={visitForm.purpose} onChange={(e) => setVisitForm({ ...visitForm, purpose: e.target.value })} placeholder="What do you hope to discover or experience?" rows={3} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Preferred Dates</label>
                      <Input value={visitForm.preferred_dates} onChange={(e) => setVisitForm({ ...visitForm, preferred_dates: e.target.value })} placeholder="e.g. June 2026" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Group Size</label>
                      <Input type="number" min={1} value={visitForm.group_size} onChange={(e) => setVisitForm({ ...visitForm, group_size: parseInt(e.target.value) || 1 })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Special Requests</label>
                    <Textarea value={visitForm.special_requests} onChange={(e) => setVisitForm({ ...visitForm, special_requests: e.target.value })} placeholder="Any specific needs, e.g. accessibility, language preferences" rows={2} />
                  </div>
                  <Button onClick={handleVisitRequest} className="w-full bg-primary text-primary-foreground">
                    <Send className="h-4 w-4 mr-2" /> Submit Visit Request
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Diaspora Forum */}
          <TabsContent value="forum">
            <div className="space-y-6">
              {/* Category filter */}
              <div className="flex flex-wrap gap-2">
                {forumCategories.map((cat) => (
                  <Button
                    key={cat.value}
                    size="sm"
                    variant={forumCategory === cat.value ? "default" : "outline"}
                    onClick={() => setForumCategory(cat.value)}
                    className={forumCategory === cat.value ? "bg-primary text-primary-foreground" : ""}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>

              {/* New post */}
              {user && (
                <Card className="border-border/50">
                  <CardContent className="pt-4 space-y-3">
                    <Input value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} placeholder="Post title..." />
                    <Textarea value={newPostBody} onChange={(e) => setNewPostBody(e.target.value)} placeholder="Share your story, ask a question, or connect with others..." rows={3} />
                    <Button onClick={handleSubmitPost} className="bg-primary text-primary-foreground">
                      <Send className="h-4 w-4 mr-2" /> Post
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Posts */}
              <div className="space-y-4">
                {forumPosts?.map((post) => (
                  <Card key={post.id} className="border-border/50">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{post.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Badge variant="outline" className="text-xs">{post.category}</Badge>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            {post.community_tag && <span className="text-secondary">#{post.community_tag}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageCircle className="h-3.5 w-3.5" /> {post.reply_count}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{post.body}</p>
                    </CardContent>
                  </Card>
                ))}
                {(!forumPosts || forumPosts.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No posts yet. Be the first to start a conversation!</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <FooterSection />
    </div>
  );
};

export default HeritagePage;
