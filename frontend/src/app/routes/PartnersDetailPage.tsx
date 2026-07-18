import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Globe, Facebook, Instagram, Twitter, MessageCircle, Building2, BadgeCheck, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface PartnerDetail {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  county: string | null;
  address_line: string | null;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  whatsapp_number: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  gallery_images: string[];
  business_categories: { label: string } | null;
}

function usePublicPartner(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-partner", slug],
    queryFn: async () => {
      const { data, error } = await (supabase.from("businesses" as never) as any)
        .select(
          "id, name, slug, description, county, address_line, website_url, facebook_url, instagram_url, twitter_url, whatsapp_number, logo_url, cover_image_url, gallery_images, business_categories(label)",
        )
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as PartnerDetail | null;
    },
    enabled: !!slug,
  });
}

const PartnersDetailPage = () => {
  const { slug } = useParams();
  const { data: partner, isLoading } = usePublicPartner(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24">
          <Skeleton className="h-72 w-full rounded-none" />
          <div className="container mx-auto space-y-4 px-4 py-8">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
        <FooterSection />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 pt-24 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-body text-muted-foreground">This partner isn't available.</p>
          <Link to="/partners" className="text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="mr-1 inline h-3.5 w-3.5" /> Back to all partners
          </Link>
        </div>
        <FooterSection />
      </div>
    );
  }

  const links = [
    { url: partner.website_url, icon: Globe, label: "Website" },
    { url: partner.facebook_url, icon: Facebook, label: "Facebook" },
    { url: partner.instagram_url, icon: Instagram, label: "Instagram" },
    { url: partner.twitter_url, icon: Twitter, label: "Twitter" },
  ].filter((l) => l.url);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative h-72 w-full overflow-hidden bg-muted pt-16">
        {partner.cover_image_url ? (
          <img src={partner.cover_image_url} alt={partner.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card -mt-16 mb-8 flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            {partner.logo_url ? (
              <img src={partner.logo_url} alt="" className="h-16 w-16 rounded-full border-4 border-background object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-muted">
                <Building2 className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display text-2xl font-bold text-foreground">{partner.name}</h1>
                <BadgeCheck className="h-5 w-5 shrink-0 text-primary" />
              </div>
              {partner.business_categories?.label && (
                <span className="font-body text-sm text-muted-foreground">{partner.business_categories.label}</span>
              )}
              {partner.county && (
                <p className="flex items-center gap-1 font-body text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {partner.address_line ? `${partner.address_line}, ` : ""}
                  {partner.county}
                </p>
              )}
            </div>
          </div>
          {partner.whatsapp_number && (
            <a
              href={`https://wa.me/${partner.whatsapp_number.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-safari flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" /> Contact on WhatsApp
            </a>
          )}
        </motion.div>

        <div className="grid grid-cols-1 gap-8 pb-16 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {partner.description && (
              <div>
                <h2 className="mb-2 font-display text-lg font-semibold text-foreground">About</h2>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">{partner.description}</p>
              </div>
            )}

            {partner.gallery_images.length > 0 && (
              <div>
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Gallery</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {partner.gallery_images.map((url, i) => (
                    <img key={i} src={url} alt="" className="h-32 w-full rounded-lg object-cover" loading="lazy" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {links.length > 0 && (
            <div className="rounded-2xl border border-border p-5">
              <h2 className="mb-3 font-display text-sm font-semibold text-foreground">Links</h2>
              <div className="space-y-2">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary"
                  >
                    <l.icon className="h-4 w-4" /> {l.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <FooterSection />
    </div>
  );
};

export default PartnersDetailPage;
