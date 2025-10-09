import { Link } from "react-router-dom";
import { Instagram, Mail, Heart } from "lucide-react";
import hestiaLogo from "@/assets/hestia-logo.svg";
export const Footer = () => {
  return <footer className="bg-card border-t border-border mt-24">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={hestiaLogo} alt="Hestia" className="h-12" />
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Celebrating the makers behind your neighborhood's hidden treasures.
              Connect with local artisans crafting beauty from home.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-semibold mb-4 text-foreground">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/browse" className="text-muted-foreground hover:text-primary transition-colors">
                  Browse Creators
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Hestia
                </Link>
              </li>
              <li>
                <Link to="/join" className="text-muted-foreground hover:text-primary transition-colors">
                  Join as Creator
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-serif font-semibold mb-4 text-foreground">Connect</h3>
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center transition-all hover:scale-110" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-primary hover:text-primary-foreground" />
              </a>
              <a href="mailto:hello@hestia.com" className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center transition-all hover:scale-110" aria-label="Email">
                <Mail className="h-5 w-5 text-primary hover:text-primary-foreground" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Hestia. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>;
};