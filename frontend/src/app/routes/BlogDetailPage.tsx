import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import type { Block } from "@/domains/admin/types/block";
import { BlockListRenderer } from "@/components/BlockRenderer";
import Seo from "@/components/Seo";

type BlogPostRow = Tables<"blog_posts">;

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["public-blog-post", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data as BlogPostRow | null;
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

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Article not found</h1>
          <Link to="/blog" className="text-sunset-orange hover:underline font-body">
            ← Back to the blog
          </Link>
        </div>
      </div>
    );
  }

  const blocks = ((post.body_blocks as unknown as Block[]) ?? []) as Block[];

  return (
    <div className="min-h-screen bg-background">
      <Seo title={post.meta_title || post.title} description={post.meta_description || post.excerpt} image={post.cover_image} />
      <Navbar />

      <article className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/blog" className="text-sm text-safari-green font-body hover:underline mb-6 inline-block">
            ← Back to the blog
          </Link>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{post.title}</h1>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-body mb-6">
            <Calendar className="h-4 w-4" /> {formatDate(post.published_at ?? post.created_at)}
          </div>

          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8"
              loading="lazy"
            />
          )}

          {post.excerpt && (
            <p className="text-lg text-muted-foreground font-body mb-8">{post.excerpt}</p>
          )}

          <BlockListRenderer blocks={blocks} />
        </div>
      </article>

      <FooterSection />
    </div>
  );
};

export default BlogDetailPage;
