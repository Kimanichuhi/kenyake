import type { Block } from "@/domains/admin/types/block";

export function BlockRenderer({ block }: { block: Block }) {
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

export function BlockListRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </>
  );
}
