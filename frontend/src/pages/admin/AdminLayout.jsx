import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Scissors, Image, Images, ClipboardList, Settings, MessageSquareQuote, ShoppingBag,
  LayoutGrid, Menu, X, ArrowLeft, LogOut, KeyRound, ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSiteConfig } from "../../context/SiteConfigContext";
import Portal from "../../components/Portal";
import ChangePasswordModal from "./ChangePasswordModal";

const nav = {
  dashboard: { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  products: { to: "/admin/products", label: "Products", icon: ShoppingBag },
  slides: { to: "/admin/slides", label: "Slides", icon: Images },
  orders: { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  categories: { to: "/admin/categories", label: "Categories", icon: LayoutGrid },
  services: { to: "/admin/services", label: "Services", icon: Scissors },
  gallery: { to: "/admin/gallery", label: "Gallery", icon: Image },
  testimonials: { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  settings: { to: "/admin/site-config", label: "Site Settings", icon: Settings },
};

const sidebarItems = Object.values(nav);
const bottomTabs = [nav.dashboard, nav.products, nav.slides, nav.orders]; // + "More"
const moreItems = [nav.categories, nav.services, nav.gallery, nav.testimonials, nav.settings];

const AdminLayout = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { logout } = useAuth();
  const { brandName } = useSiteConfig();
  const { pathname } = useLocation();

  useEffect(() => setMoreOpen(false), [pathname]);

  const moreActive = moreItems.some((i) => pathname.startsWith(i.to));

  return (
    <div className="min-h-screen flex bg-beige">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col sticky top-0 h-screen w-72 bg-plum text-cream shrink-0">
        <div className="p-6 border-b border-cream/10">
          <Link to="/" className="flex items-center gap-2">
            <Scissors className="text-gold" size={22} />
            <span className="font-display text-lg font-semibold truncate">{brandName} Admin</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {sidebarItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? "bg-cream/15 text-gold" : "text-cream/80 hover:bg-cream/10"
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-cream/10">
          <Link to="/" className="flex items-center gap-2 text-cream/70 hover:text-cream text-sm px-2 py-2">
            <ArrowLeft size={16} /> Back to site
          </Link>
          <button onClick={() => setShowPassword(true)} className="flex items-center gap-2 text-cream/70 hover:text-cream text-sm px-2 py-2 w-full">
            <KeyRound size={16} /> Change password
          </button>
          <button onClick={logout} className="flex items-center gap-2 text-cream/70 hover:text-terracotta text-sm px-2 py-2 w-full">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {showPassword && <ChangePasswordModal onClose={() => setShowPassword(false)} />}

      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b border-plum/10 h-14 px-4 flex items-center justify-between">
          <span className="flex items-center gap-2 font-display text-plum font-semibold truncate">
            <Scissors size={18} className="text-terracotta" /> {brandName} <span className="text-xs font-body text-plum-dark/50">Admin</span>
          </span>
          <Link to="/" className="flex items-center gap-1 text-xs font-medium text-terracotta">
            View site <ExternalLink size={14} />
          </Link>
        </header>

        <main className="p-4 sm:p-8 pb-28 lg:pb-8">
          <div key={pathname} className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar: Dashboard · Products · Slides · Orders · More */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-plum/10 shadow-[0_-6px_24px_-12px_rgba(106,27,56,0.25)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Admin"
      >
        <ul className="grid grid-cols-5 h-16">
          {bottomTabs.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `tab-item ${isActive ? "is-active text-plum" : "text-plum-dark/55"} relative h-full flex flex-col items-center justify-center gap-1 text-[11px] font-medium active:bg-plum/5`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="tab-bar absolute top-0 left-1/4 right-1/4 h-[3px] rounded-b-full bg-terracotta" />
                    <span className="tab-icon">
                      <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} className={isActive ? "text-terracotta" : ""} />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={() => setMoreOpen(true)}
              className={`tab-item ${moreActive ? "is-active text-plum" : "text-plum-dark/55"} relative w-full h-full flex flex-col items-center justify-center gap-1 text-[11px] font-medium active:bg-plum/5`}
            >
              <span className="tab-bar absolute top-0 left-1/4 right-1/4 h-[3px] rounded-b-full bg-terracotta" />
              <span className="tab-icon">
                <Menu size={22} strokeWidth={moreActive ? 2.4 : 1.8} className={moreActive ? "text-terracotta" : ""} />
              </span>
              More
            </button>
          </li>
        </ul>
      </nav>

      {/* "More" sheet */}
      {moreOpen && (
        <Portal>
          <div className="lg:hidden fixed inset-0 z-[70] flex items-end animate-fadeIn">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMoreOpen(false)} />
            <div className="relative bg-cream w-full rounded-t-3xl animate-sheetUp" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-plum/10">
                <h2 className="font-display text-xl text-plum font-semibold">More</h2>
                <button onClick={() => setMoreOpen(false)} aria-label="Close">
                  <X size={22} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 p-5">
                {moreItems.map(({ to, label, icon: Icon }, i) => (
                  <Link
                    key={to}
                    to={to}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className="animate-popIn flex flex-col items-center gap-2 py-4 rounded-2xl bg-white border border-plum/10 text-plum-dark text-xs font-medium active:scale-95 transition-transform"
                  >
                    <span className="w-11 h-11 rounded-full bg-blush/40 text-plum flex items-center justify-center">
                      <Icon size={20} />
                    </span>
                    {label}
                  </Link>
                ))}
              </div>
              <div className="px-5 pb-5 grid grid-cols-3 gap-3 text-xs font-medium">
                <Link to="/" className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white border border-plum/10 text-plum-dark">
                  <ArrowLeft size={18} /> View site
                </Link>
                <button onClick={() => { setMoreOpen(false); setShowPassword(true); }} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white border border-plum/10 text-plum-dark">
                  <KeyRound size={18} /> Password
                </button>
                <button onClick={logout} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white border border-plum/10 text-terracotta">
                  <LogOut size={18} /> Sign out
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default AdminLayout;
