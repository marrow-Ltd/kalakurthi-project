import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { optimizeImage } from "../utils/format";

export const CategoryIcon = ({ name, ...props }) => {
  const Icon = Icons[name] || Icons.Sparkles;
  return <Icon {...props} />;
};

// Round category shortcuts with a soft coloured halo (horizontally scrollable on phones)
const CategoryCircles = ({ categories, loading }) => {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-5 flex gap-5 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shrink-0 w-[74px] flex flex-col items-center gap-2">
            <div className="skeleton w-[68px] h-[68px] rounded-full" />
            <div className="skeleton w-12 h-3 rounded-full" />
          </div>
        ))}
      </div>
    );
  }
  if (!categories.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 pt-5 pb-1" aria-label="Shop by category">
      <div className="flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar px-3 sm:px-0 pt-2 pb-4 lg:justify-center snap-x">
        {categories.map((c, i) => (
          <Link
            key={c._id}
            to={`/shop?category=${c.slug}`}
            style={{ "--i": i }}
            className="cat-item snap-start shrink-0 flex flex-col items-center w-[76px] sm:w-24"
          >
            <div
              className="cat-circle relative w-[68px] h-[68px] sm:w-20 sm:h-20 rounded-full flex items-center justify-center overflow-hidden ring-4 ring-white"
              style={{
                background: `radial-gradient(circle at 50% 35%, #ffffff 0%, ${c.color || "#F6D9DC"} 100%)`,
                boxShadow: `0 0 0 6px ${c.color || "#F6D9DC"}66`,
              }}
            >
              {c.image ? (
                <img src={optimizeImage(c.image, 200)} alt="" loading="lazy" className="w-full h-full object-cover" />
              ) : (
                <CategoryIcon name={c.icon} size={28} className="text-plum" />
              )}
            </div>
            <span
              className="relative z-10 -mt-2.5 text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full text-plum-dark whitespace-nowrap shadow-sm"
              style={{ background: c.color || "#F6D9DC" }}
            >
              {c.name}
            </span>
          </Link>
        ))}

        <Link
          to="/categories"
          style={{ "--i": categories.length }}
          className="cat-item snap-start shrink-0 flex flex-col items-center w-[76px] sm:w-24"
        >
          <div className="cat-circle w-[68px] h-[68px] sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-plum text-cream ring-4 ring-white">
            <Icons.LayoutGrid size={26} />
          </div>
          <span className="relative z-10 -mt-2.5 text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-plum text-cream whitespace-nowrap">
            View All
          </span>
        </Link>
      </div>
    </section>
  );
};

export default CategoryCircles;
