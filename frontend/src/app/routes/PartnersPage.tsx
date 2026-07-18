import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, Building2, BadgeCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface PartnerListItem {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  county: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  business_categories: { label: string } | null;
}

function usePublicPartners() {
  return useQuery({
    queryKey: ["public-partners"],
    queryFn: async () => {
      // RLS already restricts this to status = 'approved' for anonymous/public
      // sessions (see "Public can view approved businesses" policy).
      const { data, error } = await (supabase.from("businesses" as never) as any)
        .select("id, name, slug, description, county, logo_url, cover_image_url, business_categories(label)")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PartnerListItem[];
    },
  });
}

const PartnersPage = () => {
  const [search, setSearch] = useState("");
  const { data: partners = [], isLoading } = usePublicPartners();

  const categories = ["All", ...Array.from(new Set(partners.map((p) => p.business_categories?.label).filter(Boolean)))] as string[];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = partners.filter((p) => {
    const matchCategory = selectedCategory === "All" || p.business_categories?.label === selectedCategory;
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || (p.county ?? "").toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Verified Partners</h1>
            <p className="mx-auto mt-3 max-w-2xl font-body text-muted-foreground">
              Tourism businesses across Kenya, reviewed and verified by Sync Safaris.
            </p>
            <Button asChild className="mt-5 gradient-safari border-0 text-primary-foreground">
              <Link to="/become-a-partner">List your business</Link>
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mx-auto mb-8 max-w-xl">
            <div className="glass-card flex items-center gap-3 px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search partners or counties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </motion.div>

          {categories.length > 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 font-body text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? "gradient-safari text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)]">
                  <Skeleton className="h-40 w-full rounded-none" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Building2 className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
              <p className="font-body text-muted-foreground">
                {partners.length === 0 ? "No verified partners yet — check back soon." : "No partners match your search."}
              </p>
            </div>
          ) : (
            <>
              <p className="mb-6 font-body text-sm text-muted-foreground">{filtered.length} partners found</p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((partner, i) => (
                  <motion.div key={partner.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/partners/${partner.slug ?? partner.id}`} className="group block">
                      <div className="overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]">
                        <div className="relative h-40 overflow-hidden bg-muted">
                          {partner.cover_image_url ? (
                            <img
                              src={partner.cover_image_url}
                              alt={partner.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Building2 className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                          )}
                          {partner.business_categories?.label && (
                            <span className="glass-card-dark absolute left-3 top-3 rounded-full px-3 py-1 font-body text-xs font-medium text-primary-foreground">
                              {partner.business_categories.label}
                            </span>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="mb-1 flex items-center gap-1.5">
                            {partner.logo_url && (
                              <img src={partner.logo_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                            )}
                            <h3 className="font-display text-lg font-semibold text-foreground">{partner.name}</h3>
                            <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                          </div>
                          {partner.county && (
                            <p className="flex items-center gap-1 font-body text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" /> {partner.county}
                            </p>
                          )}
                          {partner.description && (
                            <p className="mt-2 line-clamp-2 font-body text-xs text-muted-foreground">{partner.description}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default PartnersPage;
