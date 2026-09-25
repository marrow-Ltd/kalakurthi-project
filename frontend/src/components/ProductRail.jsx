import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

// Horizontal swipe row of products with a "View all" link (used on the home page & product page)
const ProductRail = ({ eyebrow, title, to, products, loading }) => {
  if (!loading && products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Reveal className="flex items-end justify-between mb-5">
        <div>
          {eyebrow && <span className="section-eyebrow flex">{eyebrow}</span>}
          <h2 className="font-display text-2xl sm:text-3xl text-plum font-semibold">{title}</h2>
        </div>
        {to && (
          <Link to={to} className="group flex items-center gap-1 text-sm font-semibold text-terracotta">
            View all <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </Reveal>

      <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[46%] sm:w-[30%] lg:w-[23%] skeleton aspect-[3/4.6] rounded-2xl" />
            ))
          : products.map((p, i) => (
              <Reveal key={p._id} delay={Math.min(i, 5) * 70} className="snap-start shrink-0 w-[46%] sm:w-[30%] lg:w-[23%]">
                <ProductCard product={p} />
              </Reveal>
            ))}
      </div>
    </section>
  );
};

export default ProductRail;
