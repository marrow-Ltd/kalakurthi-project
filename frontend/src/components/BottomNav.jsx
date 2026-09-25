import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, ShoppingBag, BadgePercent, Scissors } from "lucide-react";

// Fixed bottom tab bar (phones/tablets only) — Home · Categories · Shop · Offers · Custom
const tabs = [
  { to: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  { to: "/categories", label: "Categories", icon: LayoutGrid, match: (p) => p.startsWith("/categories") },
  {
    to: "/shop",
    label: "Shop",
    icon: ShoppingBag,
    match: (p, q) => (p.startsWith("/shop") && q.get("offers") !== "true") || p.startsWith("/product") || p.startsWith("/wishlist"),
  },
  { to: "/shop?offers=true", label: "Offers", icon: BadgePercent, match: (p, q) => p.startsWith("/shop") && q.get("offers") === "true" },
  { to: "/custom-order", label: "Custom", icon: Scissors, match: (p) => p.startsWith("/custom-order") },
];

const BottomNav = () => {
  const { pathname, search } = useLocation();
  const query = new URLSearchParams(search);

  return (
    <nav
      aria-label="Main"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-plum/10 shadow-[0_-6px_24px_-12px_rgba(106,27,56,0.25)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="grid grid-cols-5 h-16">
        {tabs.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname, query);
          return (
            <li key={label}>
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={`tab-item ${active ? "is-active text-plum" : "text-plum-dark/55"} relative h-full flex flex-col items-center justify-center gap-1 text-[11px] font-medium active:bg-plum/5`}
              >
                <span className="tab-bar absolute top-0 left-1/4 right-1/4 h-[3px] rounded-b-full bg-terracotta" />
                <span className="tab-icon">
                  <Icon size={22} strokeWidth={active ? 2.4 : 1.8} className={active ? "text-terracotta" : ""} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
