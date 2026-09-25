import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin, Scissors } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import BrandName from "./BrandName";
import useWhatsApp from "../hooks/useWhatsApp";
import { useSiteConfig } from "../context/SiteConfigContext";

const Footer = () => {
  const { config, brandName } = useSiteConfig();
  const wa = useWhatsApp();

  return (
    <footer className="bg-plum text-cream mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Scissors className="text-gold" size={22} />
            <BrandName className="font-display text-xl font-semibold" firstClass="text-cream" />
          </div>
          <p className="text-cream/70 text-sm leading-relaxed tagline-script text-base">
            {config?.aboutText ||
              "Hand-embroidered & crocheted keepsakes, stitched with love in every loop."}
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-display text-lg mb-4 text-gold">Explore</h4>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link to="/" className="hover:text-terracotta transition-colors">Home</Link></li>
            <li><Link to="/shop" className="hover:text-terracotta transition-colors">Shop</Link></li>
            <li><Link to="/categories" className="hover:text-terracotta transition-colors">Categories</Link></li>
            <li><Link to="/gallery" className="hover:text-terracotta transition-colors">Gallery</Link></li>
            <li><Link to="/custom-order" className="hover:text-terracotta transition-colors">Custom Order</Link></li>
            <li><Link to="/contact" className="hover:text-terracotta transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display text-lg mb-4 text-gold">Get in Touch</h4>
          <ul className="space-y-3 text-sm text-cream/80">
            <li>
              <a
                href={wa.link()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-whatsapp transition-colors"
              >
                <WhatsAppIcon size={15} className="text-whatsapp shrink-0" /> {wa.display}
              </a>
            </li>
            {config?.contactEmail && (
              <li>
                <a href={`mailto:${config.contactEmail}`} className="flex items-center gap-2 hover:text-terracotta transition-colors">
                  <Mail size={15} className="text-terracotta shrink-0" /> {config.contactEmail}
                </a>
              </li>
            )}
            {config?.contactPhone && (
              <li>
                <a href={`tel:${config.contactPhone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 hover:text-terracotta transition-colors">
                  <Phone size={15} className="text-terracotta shrink-0" /> {config.contactPhone}
                </a>
              </li>
            )}
            {config?.contactAddress && (
              <li className="flex items-center gap-2">
                <MapPin size={15} className="text-terracotta shrink-0" /> {config.contactAddress}
              </li>
            )}
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-display text-lg mb-4 text-gold">Follow Our Craft</h4>
          <div className="flex gap-3">
            {config?.instagramUrl && (
              <a
                href={config.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-cream/10 hover:bg-terracotta transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            )}
            {config?.facebookUrl && (
              <a
                href={config.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-cream/10 hover:bg-terracotta transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            )}
          </div>
          {config?.instagramHandle && (
            <p className="text-cream/60 text-xs mt-3">{config.instagramHandle}</p>
          )}
        </div>
      </div>

      <div className="border-t border-cream/10 py-5 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {brandName}. All rights reserved. Handcrafted with 🧵 in India.
      </div>
    </footer>
  );
};

export default Footer;
