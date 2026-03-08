import { MapPin, Mail, Phone } from "lucide-react";

const FooterSection = () => (
  <footer className="bg-foreground text-primary-foreground py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Brand */}
        <div>
          <span className="text-2xl font-display font-bold text-savannah-gold">
            Safari<span className="text-primary-foreground">Kenya</span>
          </span>
          <p className="text-primary-foreground/50 font-body text-sm mt-3">
            Kenya's most advanced tourism intelligence platform — connecting
            travelers with communities across all 47 counties.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="font-display font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 font-body text-sm text-primary-foreground/60">
            <li><a href="#destinations" className="hover:text-savannah-gold transition-colors">Destinations</a></li>
            <li><a href="#experiences" className="hover:text-savannah-gold transition-colors">Experiences</a></li>
            <li><a href="#wildlife" className="hover:text-savannah-gold transition-colors">Wildlife Tracker</a></li>
            <li><a href="#" className="hover:text-savannah-gold transition-colors">Community Marketplace</a></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-display font-semibold mb-4">Company</h4>
          <ul className="space-y-2 font-body text-sm text-primary-foreground/60">
            <li><a href="#" className="hover:text-savannah-gold transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-savannah-gold transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-savannah-gold transition-colors">Press</a></li>
            <li><a href="#" className="hover:text-savannah-gold transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display font-semibold mb-4">Get in Touch</h4>
          <ul className="space-y-3 font-body text-sm text-primary-foreground/60">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-savannah-gold" /> Nairobi, Kenya</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-savannah-gold" /> hello@safarkenya.co.ke</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-savannah-gold" /> +254 700 000 000</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-primary-foreground/40 text-xs font-body">
          © 2026 SafariKenya. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs font-body text-primary-foreground/40">
          <a href="#" className="hover:text-savannah-gold transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-savannah-gold transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default FooterSection;
