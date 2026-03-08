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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  TrendingUp, TreePine, Users, Heart, Award, Share2, Download, Leaf,
  DollarSign, Shield, Globe, BarChart3, Building2, GraduationCap,
  Droplets, MapPin, CheckCircle2, Zap, ChevronRight, Calculator
} from "lucide-react";
import { toast } from "sonner";

// Carbon estimation helper
const carbonEstimator = {
  flight_domestic: 0.15, // tons per flight
  flight_international: 1.2,
  safari_vehicle_per_day: 0.04,
  accommodation_per_night: 0.02,
  estimate: (flights: number, intlFlights: number, safariDays: number, nights: number) =>
    flights * 0.15 + intlFlights * 1.2 + safariDays * 0.04 + nights * 0.02,
};

const impactStats = [
  { icon: DollarSign, value: "KES 245,000", label: "Direct to Communities", desc: "Payments to hosts, guides & artisans", color: "text-primary" },
  { icon: Users, value: "18", label: "Local Businesses Supported", desc: "Lodges, guides, restaurants", color: "text-secondary" },
  { icon: TreePine, value: "12.5", label: "Hectares Conserved", desc: "Via conservation fund contributions", color: "text-primary" },
  { icon: Leaf, value: "0.8 tons", label: "Carbon Footprint", desc: "Your trip emissions (offset available)", color: "text-accent" },
];

const breakdownItems = [
  { category: "Accommodation / Malazi", amount: "KES 85,000", percent: 35, recipients: "3 community-owned lodges" },
  { category: "Guided Experiences / Uzoefu", amount: "KES 62,000", percent: 25, recipients: "5 local guides" },
  { category: "Food & Dining / Chakula", amount: "KES 38,000", percent: 16, recipients: "8 restaurants and kitchens" },
  { category: "Marketplace / Soko", amount: "KES 29,000", percent: 12, recipients: "12 artisans and cooperatives" },
  { category: "Conservation Fund / Uhifadhi", amount: "KES 18,000", percent: 7, recipients: "2 conservancies" },
  { category: "Transport / Usafiri", amount: "KES 13,000", percent: 5, recipients: "2 local drivers" },
];

const badgeTypes = [
  { type: "local_employment", icon: Users, label: "Local Employer", desc: "80%+ local staff", color: "bg-primary/10 text-primary" },
  { type: "procurement", icon: Building2, label: "Local Sourcing", desc: "70%+ locally procured", color: "bg-secondary/10 text-secondary" },
  { type: "conservation", icon: Shield, label: "Conservation Champion", desc: "Active conservation fund", color: "bg-primary/10 text-primary" },
  { type: "carbon_neutral", icon: Leaf, label: "Carbon Neutral", desc: "Verified offset programme", color: "bg-accent/10 text-accent" },
];

const ImpactPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [carbonForm, setCarbonForm] = useState({ domestic: 1, international: 1, safari: 3, nights: 5 });
  const [sponsorUnits, setSponsorUnits] = useState<Record<string, number>>({});

  const carbonEstimate = carbonEstimator.estimate(
    carbonForm.domestic, carbonForm.international, carbonForm.safari, carbonForm.nights
  );

  const { data: offsetProjects } = useQuery({
    queryKey: ["carbon-offsets"],
    queryFn: async () => {
      const { data } = await supabase.from("carbon_offset_projects").select("*").eq("is_published", true);
      return data || [];
    },
  });

  const { data: sponsorships } = useQuery({
    queryKey: ["sponsorship-projects"],
    queryFn: async () => {
      const { data } = await supabase.from("sponsorship_projects").select("*").eq("is_published", true).order("is_featured", { ascending: false });
      return data || [];
    },
  });

  const { data: impactReports } = useQuery({
    queryKey: ["impact-reports"],
    queryFn: async () => {
      const { data } = await supabase.from("community_impact_reports").select("*, communities(name, county)").eq("is_published", true).order("year", { ascending: false });
      return data || [];
    },
  });

  const handleSponsor = async (projectId: string, unitCost: number) => {
    if (!user) { toast.error("Please sign in to sponsor"); return; }
    const units = sponsorUnits[projectId] || 1;
    const amount = units * unitCost;
    const { error } = await supabase.from("sponsorship_contributions").insert({
      user_id: user.id, project_id: projectId, amount_kes: amount, units,
    });
    if (error) toast.error("Failed to process sponsorship");
    else toast.success(`Thank you! You sponsored ${units} units (KES ${amount.toLocaleString()})`);
  };

  const handleShareCertificate = () => {
    toast.success("Impact certificate generated! Share your positive travel impact.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <TrendingUp className="h-3 w-3 mr-1" /> Impact & Sustainability / Athari na Uendelevu
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Your Travel <span className="text-primary">Impact</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              See exactly how your journey supports communities, funds conservation, and preserves heritage.
              Every shilling tracked, every impact measured.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container mx-auto px-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-1 h-auto bg-muted/50 p-1 rounded-xl mb-8">
            {[
              { value: "dashboard", icon: BarChart3, label: "Impact Dashboard" },
              { value: "carbon", icon: Leaf, label: "Carbon & Offsets" },
              { value: "sponsor", icon: Heart, label: "Sponsor Projects" },
              { value: "reports", icon: Globe, label: "Community Reports" },
              { value: "badges", icon: Award, label: "Operator Badges" },
              { value: "certificate", icon: Share2, label: "Impact Certificate" },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="space-y-10">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {impactStats.map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="text-center border-border/50">
                      <CardContent className="pt-6">
                        <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-3`}>
                          <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
                        <p className="text-sm font-medium text-foreground">{stat.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Breakdown */}
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" /> Where Your Money Went / Pesa Yako Ilikwenda Wapi
                </h2>
                <div className="max-w-3xl mx-auto space-y-3">
                  {breakdownItems.map((item, i) => (
                    <motion.div key={item.category} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="border-border/50">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground text-sm">{item.category}</h3>
                              <p className="text-xs text-muted-foreground">{item.recipients}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-display font-bold text-foreground">{item.amount}</span>
                              <span className="text-xs text-muted-foreground ml-1">({item.percent}%)</span>
                            </div>
                          </div>
                          <Progress value={item.percent} className="h-2" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Carbon Estimator & Offsets */}
          <TabsContent value="carbon">
            <div className="space-y-10">
              {/* Estimator */}
              <Card className="border-border/50 max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-accent" /> Carbon Footprint Estimator</CardTitle>
                  <p className="text-sm text-muted-foreground">Estimate your trip's carbon footprint based on travel details.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-foreground">Domestic Flights</label>
                      <div className="flex items-center gap-3 mt-1">
                        <Slider value={[carbonForm.domestic]} onValueChange={([v]) => setCarbonForm({ ...carbonForm, domestic: v })} min={0} max={6} step={1} className="flex-1" />
                        <span className="text-sm font-semibold text-foreground w-6">{carbonForm.domestic}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">International Flights</label>
                      <div className="flex items-center gap-3 mt-1">
                        <Slider value={[carbonForm.international]} onValueChange={([v]) => setCarbonForm({ ...carbonForm, international: v })} min={0} max={4} step={1} className="flex-1" />
                        <span className="text-sm font-semibold text-foreground w-6">{carbonForm.international}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Safari Days (vehicle)</label>
                      <div className="flex items-center gap-3 mt-1">
                        <Slider value={[carbonForm.safari]} onValueChange={([v]) => setCarbonForm({ ...carbonForm, safari: v })} min={0} max={14} step={1} className="flex-1" />
                        <span className="text-sm font-semibold text-foreground w-6">{carbonForm.safari}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Accommodation Nights</label>
                      <div className="flex items-center gap-3 mt-1">
                        <Slider value={[carbonForm.nights]} onValueChange={([v]) => setCarbonForm({ ...carbonForm, nights: v })} min={0} max={30} step={1} className="flex-1" />
                        <span className="text-sm font-semibold text-foreground w-6">{carbonForm.nights}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center p-6 bg-muted/50 rounded-xl">
                    <Leaf className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Estimated Carbon Footprint</p>
                    <p className="text-3xl font-display font-bold text-foreground">{carbonEstimate.toFixed(2)} tons CO₂</p>
                    <p className="text-xs text-muted-foreground mt-1">Offset from ~KES {(carbonEstimate * 1500).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Offset Projects */}
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Verified Carbon Offset Projects
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {offsetProjects?.map((project) => (
                    <Card key={project.id} className="border-border/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          {project.is_verified && (
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {project.location_name}, {project.county}
                          <span className="mx-1">•</span>
                          <span>Partner: {project.partner_name}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">KES {(project.price_per_ton_kes || 0).toLocaleString()} per ton</span>
                          <span className="font-semibold text-foreground">{project.tons_available} tons available</span>
                        </div>
                        <Button className="w-full bg-primary text-primary-foreground">
                          Offset {carbonEstimate.toFixed(1)} tons — KES {(carbonEstimate * (project.price_per_ton_kes || 1500)).toLocaleString()}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Sponsor Projects */}
          <TabsContent value="sponsor">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Sponsor a Project / Fanya Mabadiliko</h2>
                <p className="text-muted-foreground">Plant trees, fund schools, and support community infrastructure across Kenya.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sponsorships?.map((project) => {
                  const progressPercent = project.goal_amount_kes ? Math.min(100, ((project.raised_amount_kes || 0) / project.goal_amount_kes) * 100) : 0;
                  const units = sponsorUnits[project.id] || 1;
                  const typeIcon = project.project_type === "tree_planting" ? TreePine : project.project_type === "school" ? GraduationCap : Droplets;
                  const TypeIcon = typeIcon;

                  return (
                    <Card key={project.id} className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <TypeIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{project.title}</CardTitle>
                            <p className="text-xs text-muted-foreground">{project.county}</p>
                          </div>
                        </div>
                        {project.is_featured && <Badge className="bg-secondary/10 text-secondary border-secondary/20 w-fit">Featured</Badge>}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{project.description}</p>

                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>KES {(project.raised_amount_kes || 0).toLocaleString()} raised</span>
                            <span>KES {(project.goal_amount_kes || 0).toLocaleString()} goal</span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{project.units_completed}/{project.units_goal} {project.unit_label}</span>
                          <span>{project.sponsor_count} sponsors</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-foreground whitespace-nowrap">
                              {project.unit_label} ×
                            </label>
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              value={units}
                              onChange={(e) => setSponsorUnits({ ...sponsorUnits, [project.id]: parseInt(e.target.value) || 1 })}
                              className="w-20"
                            />
                            <span className="text-sm text-muted-foreground">
                              = KES {(units * (project.unit_cost_kes || 0)).toLocaleString()}
                            </span>
                          </div>
                          <Button onClick={() => handleSponsor(project.id, project.unit_cost_kes || 0)} className="w-full bg-primary text-primary-foreground">
                            <Heart className="h-4 w-4 mr-2" /> Sponsor Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Community Reports */}
          <TabsContent value="reports">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Community Benefit Reports / Ripoti za Faida</h2>
                <p className="text-muted-foreground">Transparent annual reports showing how tourism revenue benefits each destination.</p>
              </div>

              {impactReports?.map((report: any) => (
                <Card key={report.id} className="border-border/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{report.communities?.name || "Community"} — {report.year}</CardTitle>
                        <p className="text-sm text-muted-foreground">{report.communities?.county}</p>
                      </div>
                      <Badge variant="outline">{report.year} Annual Report</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground">{report.summary}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { icon: Users, value: report.total_visitors?.toLocaleString(), label: "Visitors" },
                        { icon: DollarSign, value: `KES ${(report.total_revenue_kes || 0).toLocaleString()}`, label: "Total Revenue" },
                        { icon: Building2, value: report.local_employment_count, label: "Local Jobs" },
                        { icon: Shield, value: `KES ${(report.conservation_fund_kes || 0).toLocaleString()}`, label: "Conservation Fund" },
                        { icon: GraduationCap, value: `KES ${(report.education_fund_kes || 0).toLocaleString()}`, label: "Education Fund" },
                        { icon: TreePine, value: report.trees_planted?.toLocaleString(), label: "Trees Planted" },
                        { icon: GraduationCap, value: report.schools_supported, label: "Schools Supported" },
                        { icon: Zap, value: `KES ${(report.infrastructure_fund_kes || 0).toLocaleString()}`, label: "Infrastructure" },
                      ].map((stat, i) => (
                        <div key={i} className="text-center p-3 bg-muted/30 rounded-lg">
                          <stat.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
                          <p className="font-semibold text-foreground text-sm">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" /> Download Full Report
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {(!impactReports || impactReports.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Community reports coming soon.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Operator Badges */}
          <TabsContent value="badges">
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Operator Impact Badges / Beji za Athari</h2>
                <p className="text-muted-foreground">Operators earn badges for demonstrating measurable commitment to sustainability and local benefit.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {badgeTypes.map((badge) => (
                  <Card key={badge.type} className="border-border/50 text-center">
                    <CardContent className="pt-6">
                      <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full ${badge.color} mb-4`}>
                        <badge.icon className="h-8 w-8" />
                      </div>
                      <h3 className="font-semibold text-foreground">{badge.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{badge.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-border/50 bg-muted/30">
                <CardContent className="py-8 text-center">
                  <Award className="h-10 w-10 text-secondary mx-auto mb-3" />
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">Impact Filter Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                    Soon you'll be able to filter accommodations, experiences, and guides by their impact badges.
                    Choose operators who prioritize local employment, conservation, and community benefit.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Impact Certificate */}
          <TabsContent value="certificate">
            <div className="max-w-2xl mx-auto">
              <Card className="border-border/50 overflow-hidden">
                <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground text-center">
                  <Award className="h-16 w-16 mx-auto mb-4 opacity-90" />
                  <h2 className="font-display text-3xl font-bold mb-2">Responsible Traveler</h2>
                  <p className="text-primary-foreground/70 text-sm">Impact Certificate / Cheti cha Athari</p>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Communities Supported", value: "4" },
                      { label: "Local Businesses", value: "18" },
                      { label: "Conservation Contribution", value: "KES 18,000" },
                      { label: "Carbon Offset", value: "0.8 tons" },
                      { label: "Trees Planted", value: "12" },
                      { label: "Local Jobs Supported", value: "34" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="font-semibold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {["Community Supporter", "Conservation Contributor", "Cultural Ambassador", "Carbon Neutral"].map((badge) => (
                      <Badge key={badge} variant="outline" className="text-xs">{badge}</Badge>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleShareCertificate} className="flex-1 bg-primary text-primary-foreground">
                      <Share2 className="h-4 w-4 mr-2" /> Share on Social Media
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" /> Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <FooterSection />
    </div>
  );
};

export default ImpactPage;
