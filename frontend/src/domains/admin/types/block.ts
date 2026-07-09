export type BlockType =
  | "hero"
  | "rich_text"
  | "image_gallery"
  | "feature_cards"
  | "testimonials"
  | "faq"
  | "cta"
  | "stats";

interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeroBlock extends BaseBlock {
  type: "hero";
  heading: string;
  subheading?: string;
  image?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface RichTextBlock extends BaseBlock {
  type: "rich_text";
  html: string;
}

export interface ImageGalleryBlock extends BaseBlock {
  type: "image_gallery";
  images: { url: string; caption?: string }[];
}

export interface FeatureCardsBlock extends BaseBlock {
  type: "feature_cards";
  items: { title: string; body: string }[];
}

export interface TestimonialsBlock extends BaseBlock {
  type: "testimonials";
  items: { quote: string; author: string; role?: string }[];
}

export interface FaqBlock extends BaseBlock {
  type: "faq";
  items: { question: string; answer: string }[];
}

export interface CtaBlock extends BaseBlock {
  type: "cta";
  heading: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface StatsBlock extends BaseBlock {
  type: "stats";
  items: { value: string; label: string }[];
}

export type Block =
  | HeroBlock
  | RichTextBlock
  | ImageGalleryBlock
  | FeatureCardsBlock
  | TestimonialsBlock
  | FaqBlock
  | CtaBlock
  | StatsBlock;

export const emptyBlockOf = (type: BlockType): Block => {
  const id = crypto.randomUUID();
  switch (type) {
    case "hero":
      return { id, type, heading: "New hero heading" };
    case "rich_text":
      return { id, type, html: "<p>Write something...</p>" };
    case "image_gallery":
      return { id, type, images: [] };
    case "feature_cards":
      return { id, type, items: [] };
    case "testimonials":
      return { id, type, items: [] };
    case "faq":
      return { id, type, items: [] };
    case "cta":
      return { id, type, heading: "Ready to explore?", buttonLabel: "Learn more", buttonHref: "" };
    case "stats":
      return { id, type, items: [] };
  }
};

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero",
  rich_text: "Rich Text",
  image_gallery: "Image Gallery",
  feature_cards: "Feature Cards",
  testimonials: "Testimonials",
  faq: "FAQ",
  cta: "Call To Action",
  stats: "Stats",
};
