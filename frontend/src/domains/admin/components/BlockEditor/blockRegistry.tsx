import { LayoutTemplate, Type, Images, LayoutGrid, Quote, HelpCircle, Megaphone, BarChart3 } from "lucide-react";
import { Block, BlockType, BLOCK_LABELS } from "../../types/block";
import { HeroBlockEditor } from "./blocks/HeroBlockEditor";
import { RichTextBlockEditor } from "./blocks/RichTextBlockEditor";
import { ImageGalleryBlockEditor } from "./blocks/ImageGalleryBlockEditor";
import {
  FeatureCardsBlockEditor,
  TestimonialsBlockEditor,
  FaqBlockEditor,
  CtaBlockEditor,
  StatsBlockEditor,
} from "./blocks/SimpleBlockEditors";

export interface BlockRegistryEntry {
  label: string;
  icon: typeof LayoutTemplate;
  Editor: (props: { value: Block; onChange: (v: Block) => void }) => JSX.Element;
}

export const blockRegistry: Record<BlockType, BlockRegistryEntry> = {
  hero: { label: BLOCK_LABELS.hero, icon: LayoutTemplate, Editor: HeroBlockEditor as BlockRegistryEntry["Editor"] },
  rich_text: { label: BLOCK_LABELS.rich_text, icon: Type, Editor: RichTextBlockEditor as BlockRegistryEntry["Editor"] },
  image_gallery: {
    label: BLOCK_LABELS.image_gallery,
    icon: Images,
    Editor: ImageGalleryBlockEditor as BlockRegistryEntry["Editor"],
  },
  feature_cards: {
    label: BLOCK_LABELS.feature_cards,
    icon: LayoutGrid,
    Editor: FeatureCardsBlockEditor as BlockRegistryEntry["Editor"],
  },
  testimonials: {
    label: BLOCK_LABELS.testimonials,
    icon: Quote,
    Editor: TestimonialsBlockEditor as BlockRegistryEntry["Editor"],
  },
  faq: { label: BLOCK_LABELS.faq, icon: HelpCircle, Editor: FaqBlockEditor as BlockRegistryEntry["Editor"] },
  cta: { label: BLOCK_LABELS.cta, icon: Megaphone, Editor: CtaBlockEditor as BlockRegistryEntry["Editor"] },
  stats: { label: BLOCK_LABELS.stats, icon: BarChart3, Editor: StatsBlockEditor as BlockRegistryEntry["Editor"] },
};
