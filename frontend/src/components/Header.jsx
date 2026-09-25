import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Menu, X, Scissors, Heart, Home, ShoppingBag, LayoutGrid, BadgePercent, Image as ImageIcon,
  Sparkles, Phone, Instagram,
} from "lucide-react";
import Portal from "./Portal";
import SearchBar from "./SearchBar";
import BrandName from "./BrandName";
import WhatsAppIcon from "./WhatsAppIcon";
import useWhatsApp from "../hooks/useWhatsApp";
import { useWishlist } from "../context/WishlistContext";
import { useSiteConfig } from "../context/SiteConfigContext";

const desktopLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/gallery", label: "Gallery" },
  { to: "/custom-order", label: "Custom Order" },
  { to: "/contact", label: "Contact" },
];

const drawerLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/shop", label: "Shop All", icon: ShoppingBag },
  { to: "/categories", label: "Categories", icon: LayoutGrid },
  { to: "/shop?offers=true", label: "Offers", icon: BadgePercent },
  { to: "/gallery", label: "Gallery", icon: ImageIcon },
  { to: "/#services", label: "Our Services", icon: Sparkles },
  { to: "/custom-order", label: "Custom Order", icon: Scissors },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/contact", label: "Contact", icon: Phone },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { count } = useWishlist();
  const { config, brandName } = useSiteConfig();
  const wa = useWhatsApp();

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      {/* Sticky top bar: hamburger · brand · wishlist · WhatsApp (mobile)  |  brand · nav · search · icons (desktop) */}
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-plum/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center gap-2 lg:gap-6">
          <button
            className="lg:hidden w-10 h-10 -ml-1 flex items-center justify-center text-plum rounded-full active:bg-plum/10"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu size={26} />
          </button>

          <Link to="/" className="flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2 group min-w-0">
            <Scissors className="text-terracotta group-hover:rotate-12 transition-transform duration-300 shrink-0 hidden sm:block lg:block" size={26} />
            <div className="flex flex-col leading-tight items-center lg:items-start min-w-0">
              <BrandName className="font-display text-xl sm:text-2xl font-semibold truncate max-w-full" firstClass="text-plum" />
              <span className="tagline-script text-[11px] text-olive -mt-0.5 hidden sm:block">
                {config?.brandTagline ?? "stitched with love"}
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
            {desktopLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `relative text-sm font-medium py-1 transition-colors duration-200 after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-full after:bg-terracotta after:origin-left after:transition-transform after:duration-300 ${
                    isActive
                      ? "text-terracotta after:scale-x-100"
                      : "text-plum-dark hover:text-terracotta after:scale-x-0 hover:after:scale-x-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <SearchBar className="hidden lg:flex w-56 xl:w-72" />

          <Link to="/wishlist" aria-label="Wishlist" className="relative w-10 h-10 flex items-center justify-center text-plum rounded-full active:bg-plum/10 hover:bg-plum/5">
            <Heart size={23} />
            {count > 0 && (
              <span key={count} className="absolute top-0.5 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-terracotta text-white text-[10px] font-semibold flex items-center justify-center animate-popIn">
                {count}
              </span>
            )}
          </Link>

          <a
            href={wa.link()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="lg:hidden w-10 h-10 -mr-1 flex items-center justify-center text-whatsapp rounded-full active:bg-whatsapp/10"
          >
            <WhatsAppIcon size={24} />
          </a>
          <a href={wa.link()} target="_blank" rel="noopener noreferrer" className="hidden lg:inline-flex btn-whatsapp btn-shine">
            <WhatsAppIcon size={16} /> Chat on WhatsApp
          </a>
        </div>
      </header>

      {/* Mobile search row (scrolls away with the page, like a shopping app) */}
      <div className="lg:hidden px-4 pt-3 pb-1 bg-cream">
        <SearchBar />
      </div>

      {/* Slide-out drawer (rendered in <body> so it always covers the whole screen) */}
      <Portal>
        <div className={`lg:hidden fixed inset-0 z-[60] ${menuOpen ? "" : "pointer-events-none"}`} aria-hidden={!menuOpen}>
          <div
            className={`drawer-backdrop absolute inset-0 bg-black/50 ${menuOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setMenuOpen(false)}
          />
          <aside
            className={`drawer-panel absolute top-0 left-0 h-full w-[80%] max-w-xs bg-cream shadow-soft flex flex-col ${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-plum/10 bg-gradient-to-r from-plum to-plum-light text-cream">
              <span className="font-display text-xl font-semibold">{brandName}</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col p-3 flex-1 overflow-y-auto">
              {drawerLinks.map(({ to, label, icon: Icon }, i) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  style={{ "--i": i }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium text-plum-dark active:bg-blush/40 hover:bg-blush/25 ${
                    menuOpen ? "drawer-link" : "opacity-0"
                  }`}
                >
                  <span className="w-9 h-9 rounded-full bg-blush/40 text-plum flex items-center justify-center">
                    <Icon size={18} />
                  </span>
                  {label}
                  {label === "Wishlist" && count > 0 && (
                    <span className="ml-auto text-xs bg-terracotta text-white rounded-full px-2 py-0.5">{count}</span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-dashed border-terracotta/40 space-y-3" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
              <a href={wa.link()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp btn-shine w-full" onClick={() => setMenuOpen(false)}>
                <WhatsAppIcon size={18} /> Chat on WhatsApp
              </a>
              {config?.instagramUrl && (
                <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm text-plum-dark/70 hover:text-terracotta">
                  <Instagram size={16} /> {config.instagramHandle || "Instagram"}
                </a>
              )}
            </div>
          </aside>
        </div>
      </Portal>
    </>
  );
};

export default Header;
