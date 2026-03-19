import logo from "@/assets/looplic-logo.webp";
import { MapPin, Phone, Mail, Instagram, MessageCircle } from "lucide-react";

const Footer = () => (
  <footer className="py-8 bg-card border-t border-border">
    <div className="container">
      <div className="flex flex-col gap-6">
        {/* Logo & tagline */}
        <div className="text-center">
          <img src={logo} alt="Looplic" className="h-7 mx-auto mb-2" />
          <p className="text-[11px] text-muted-foreground">
            India's trusted doorstep screen guard service
          </p>
        </div>

        {/* Quick links row */}
        <div className="flex justify-center gap-6 text-xs font-semibold text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Services</a>
          <a href="#" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          <a href="#" className="hover:text-foreground transition-colors">FAQ</a>
        </div>

        {/* Contact chips */}
        <div className="flex flex-wrap justify-center gap-2">
          <a href="tel:+919876543210" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs font-semibold text-foreground">
            <Phone className="w-3 h-3" /> +91 98765 43210
          </a>
          <a href="mailto:hello@looplic.com" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs font-semibold text-foreground">
            <Mail className="w-3 h-3" /> hello@looplic.com
          </a>
        </div>

        {/* Social icons */}
        <div className="flex justify-center gap-3">
          {[Instagram, MessageCircle].map((Icon, i) => (
            <a key={i} href="#" className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>

        <div className="pt-4 border-t border-border text-center">
          <p className="text-[10px] text-muted-foreground">
            © {new Date().getFullYear()} Looplic. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
