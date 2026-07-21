import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import type { Block } from "@/domains/admin/types/block";
import { BlockListRenderer } from "@/components/BlockRenderer";
import Seo from "@/components/Seo";
import NotFound from "./NotFound";

type PageRow = Tables<"pages">;

const PageDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading } = useQuery({
    queryKey: ["public-page", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data as PageRow | null;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!page) {
    return <NotFound />;
  }

  const blocks = ((page.body_blocks as unknown as Block[]) ?? []) as Block[];

  return (
    <div className="min-h-screen bg-background">
      <Seo title={page.meta_title || page.title} description={page.meta_description} />
      <Navbar />

      <article className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/" className="text-sm text-safari-green font-body hover:underline mb-6 inline-block">
            ← Back home
          </Link>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">{page.title}</h1>

          <BlockListRenderer blocks={blocks} />
        </div>
      </article>

      <FooterSection />
    </div>
  );
};

export default PageDetailPage;
