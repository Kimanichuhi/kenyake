import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import type { Block } from "@/domains/admin/types/block";

type BlogPostRow = Tables<"blog_posts">;

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "hero":
      return (
        <div className="relative rounded-2xl overflow-hidden bg-muted mb-10">
          {block.image && (
            <img src={block.image} alt={block.heading} className="w-full h-72 md:h-96 object-cover" loading="lazy" />
          )}
          <div className={block.image ? "absolute inset-0 flex flex-col items-start justify-end p-8 bg-gradient-to-t from-black/60 to-transparent" : "p-8"}>
            <h2 className={`font-display text-2xl md:text-3xl font-bold mb-2 ${block.image ? "text-white" : "text-foreground"}`}>
              {block.heading}
            </h2>
            {block.subheading && (
              <p className={`font-body max-w-2xl ${block.image ? "text-white/90" : "text-muted-foreground"}`}>
                {block.subheading}
              </p>
            )}
            {block.ctaLabel && block.ctaHref && (
              <a
                href={block.ctaHref}
                className="inline-block mt-4 gradient-sunset text-primary-foreground px-5 py-2 rounded-xl text-sm font-body font-medium hover:opacity-90 transition-opacity"
              >
                {block.ctaLabel}
              </a>
            )}
          </div>
        </div>
      );

    case "rich_text":
      return (
        <div
          className="prose prose-neutral dark:prose-invert max-w-none font-body text-foreground mb-10"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );

    case "image_gallery":
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {block.images.map((img, i) => (
            <figure key={i} className="rounded-xl overflow-hidden bg-muted">
              <img src={img.url} alt={img.caption ?? ""} className="w-full h-40 object-cover" loading="lazy" />
              {img.caption && (
                <figcaption className="text-xs text-muted-foreground font-body p-2">{img.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      );

    case "feature_cards":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {block.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-border p-5 bg-card">
              <h4 className="font-display font-semibold text-foreground mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground font-body">{item.body}</p>
            </div>
          ))}
        </div>
      );

    case "testimonials":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {block.items.map((item, i) => (
            <blockquote key={i} className="rounded-xl border border-border p-5 bg-card">
              <p className="text-sm font-body italic text-foreground mb-3">&ldquo;{item.quote}&rdquo;</p>
              <footer className="text-xs text-muted-foreground font-body">
                {item.author}
                {item.role && <span> — {item.role}</span>}
              </footer>
            </blockquote>
          ))}
        </div>
      );

    case "faq":
      return (
        <div className="space-y-4 mb-10">
          {block.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-border p-5 bg-card">
              <h4 className="font-body font-semibold text-foreground mb-1.5">{item.question}</h4>
              <p className="text-sm text-muted-foreground font-body">{item.answer}</p>
            </div>
          ))}
        </div>
      );

    case "cta":
      return (
        <div className="rounded-2xl bg-muted/50 p-8 text-center mb-10">
          <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">{block.heading}</h3>
          <a
            href={block.buttonHref}
            className="inline-block gradient-sunset text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-body font-medium hover:opacity-90 transition-opacity"
          >
            {block.buttonLabel}
          </a>
        </div>
      );

    case "stats":
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {block.items.map((item, i) => (
            <div key={i} className="text-center rounded-xl border border-border p-5 bg-card">
              <p className="font-display text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground font-body mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

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

          {blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      </article>

      <FooterSection />
    </div>
  );
};

export default BlogDetailPage;
