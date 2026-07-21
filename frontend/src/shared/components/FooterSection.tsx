import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useFooterColumns } from "@/hooks/useFooterLinks";

const socialLinks = [
  { key: "facebook_url", icon: Facebook, label: "Facebook" },
  { key: "instagram_url", icon: Instagram, label: "Instagram" },
  { key: "twitter_url", icon: Twitter, label: "X / Twitter" },
  { key: "linkedin_url", icon: Linkedin, label: "LinkedIn" },
  { key: "youtube_url", icon: Youtube, label: "YouTube" },
] as const;

const FooterSection = () => {
  const { data: settings } = useSiteSettings();
  const { columns } = useFooterColumns();
  const companyName = settings?.company_name ?? "Sync Safaris";
  const [brandFirst, ...brandRest] = companyName.split(" ");
  const brandSecond = brandRest.join(" ");
  const activeSocialLinks = socialLinks.filter((s) => settings?.[s.key]);

  return (
  <footer className="bg-foreground text-primary-foreground py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="text-2xl font-display font-bold text-savannah-gold">
            {brandFirst}{brandSecond && <span className="text-primary-foreground">{brandSecond}</span>}
          </Link>
          <p className="text-primary-foreground/50 font-body text-sm mt-3">
            Kenya's tourism intelligence platform — all 47 counties.
          </p>
          {activeSocialLinks.length > 0 && (
            <div className="flex items-center gap-3 mt-4">
              {activeSocialLinks.map((s) => (
                <a
                  key={s.key}
                  href={settings?.[s.key] as string}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="text-primary-foreground/50 hover:text-savannah-gold transition-colors"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
        {columns.map((column) => (
          <div key={column.label}>
            <h4 className="font-display font-semibold mb-3 text-sm">{column.label}</h4>
            <ul className="space-y-1.5 font-body text-sm text-primary-foreground/60">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-savannah-gold transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm">Contact</h4>
          <ul className="space-y-2 font-body text-sm text-primary-foreground/60">
            {settings?.contact_address && (
              <li className="flex items-center gap-2"><MapPin className="h-3 w-3 text-savannah-gold" /> {settings.contact_address}</li>
            )}
            {settings?.contact_email && (
              <li className="flex items-center gap-2"><Mail className="h-3 w-3 text-savannah-gold" /> {settings.contact_email}</li>
            )}
            {settings?.contact_phone && (
              <li className="flex items-center gap-2"><Phone className="h-3 w-3 text-savannah-gold" /> {settings.contact_phone}</li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-primary-foreground/40 text-xs font-body">© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
        <div className="flex gap-6 text-xs font-body text-primary-foreground/40">
          <Link to="/privacy" className="hover:text-savannah-gold transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-savannah-gold transition-colors">Terms</Link>
          <Link to="/accessibility" className="hover:text-savannah-gold transition-colors">Accessibility</Link>
        </div>
      </div>
    </div>
  </footer>
  );
};

export default FooterSection;
