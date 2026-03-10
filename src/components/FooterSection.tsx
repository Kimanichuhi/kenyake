import { Link } from "react-router-dom";
import { MapPin, Mail, Phone } from "lucide-react";

const FooterSection = () => (
  <footer className="bg-foreground text-primary-foreground py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="text-2xl font-display font-bold text-savannah-gold">
            Safari<span className="text-primary-foreground">Sync</span>
          </Link>
          <p className="text-primary-foreground/50 font-body text-sm mt-3">
            Kenya's tourism intelligence platform — all 47 counties.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm">Explore</h4>
          <ul className="space-y-1.5 font-body text-sm text-primary-foreground/60">
            <li><Link to="/destinations" className="hover:text-savannah-gold transition-colors">Destinations</Link></li>
            <li><Link to="/experiences" className="hover:text-savannah-gold transition-colors">Experiences</Link></li>
            <li><Link to="/wildlife" className="hover:text-savannah-gold transition-colors">Wildlife Tracker</Link></li>
            <li><Link to="/food" className="hover:text-savannah-gold transition-colors">Food & Dining</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm">Connect</h4>
          <ul className="space-y-1.5 font-body text-sm text-primary-foreground/60">
            <li><Link to="/guides" className="hover:text-savannah-gold transition-colors">Local Guides</Link></li>
            <li><Link to="/community" className="hover:text-savannah-gold transition-colors">Communities</Link></li>
            <li><Link to="/events" className="hover:text-savannah-gold transition-colors">Cultural Events</Link></li>
            <li><Link to="/impact" className="hover:text-savannah-gold transition-colors">Your Impact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm">Resources</h4>
          <ul className="space-y-1.5 font-body text-sm text-primary-foreground/60">
            <li><Link to="/nomads" className="hover:text-savannah-gold transition-colors">Digital Nomads</Link></li>
            <li><Link to="/safety" className="hover:text-savannah-gold transition-colors">Safety</Link></li>
            <li><Link to="/onboard" className="hover:text-savannah-gold transition-colors">Create Profile</Link></li>
            <li><a href="#" className="hover:text-savannah-gold transition-colors">About Us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm">Contact</h4>
          <ul className="space-y-2 font-body text-sm text-primary-foreground/60">
            <li className="flex items-center gap-2"><MapPin className="h-3 w-3 text-savannah-gold" /> Nairobi, Kenya</li>
            <li className="flex items-center gap-2"><Mail className="h-3 w-3 text-savannah-gold" /> hello@safarkenya.co.ke</li>
            <li className="flex items-center gap-2"><Phone className="h-3 w-3 text-savannah-gold" /> +254 700 000 000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-primary-foreground/40 text-xs font-body">© 2026 SafariSync. All rights reserved.</p>
        <div className="flex gap-6 text-xs font-body text-primary-foreground/40">
          <a href="#" className="hover:text-savannah-gold transition-colors">Privacy</a>
          <a href="#" className="hover:text-savannah-gold transition-colors">Terms</a>
          <a href="#" className="hover:text-savannah-gold transition-colors">Accessibility</a>
        </div>
      </div>
    </div>
  </footer>
);

export default FooterSection;
