import logo from "@/assets/looplic-logo.webp";
import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => (
  <footer className="py-10 bg-card border-t border-border">
    <div className="container">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        <div className="max-w-xs">
          <img src={logo} alt="Looplic" className="h-8 mb-3" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            India's trusted doorstep screen guard installation service. Premium protection, zero hassle.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <h4 className="font-bold text-foreground mb-3 text-xs uppercase tracking-wider">Services</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>Tempered Glass</li>
              <li>Privacy Guard</li>
              <li>Matte Guard</li>
              <li>UV Glass Guard</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 text-xs uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> +91 98765 43210</li>
              <li className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> hello@looplic.com</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> All Major Cities</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Looplic. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
