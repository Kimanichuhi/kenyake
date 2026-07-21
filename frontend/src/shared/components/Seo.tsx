import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface SeoProps {
  title?: string | null;
  description?: string | null;
  image?: string | null;
}

export const Seo = ({ title, description, image }: SeoProps) => {
  const { data: settings } = useSiteSettings();

  const resolvedTitle = title || settings?.default_meta_title || "Sync Safaris";
  const resolvedDescription = description || settings?.default_meta_description || undefined;
  const resolvedImage = image || settings?.default_og_image || undefined;

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      {resolvedDescription && <meta name="description" content={resolvedDescription} />}
      <meta property="og:title" content={resolvedTitle} />
      {resolvedDescription && <meta property="og:description" content={resolvedDescription} />}
      {resolvedImage && <meta property="og:image" content={resolvedImage} />}
      <meta name="twitter:title" content={resolvedTitle} />
      {resolvedDescription && <meta name="twitter:description" content={resolvedDescription} />}
      {resolvedImage && <meta name="twitter:image" content={resolvedImage} />}
    </Helmet>
  );
};

export default Seo;
