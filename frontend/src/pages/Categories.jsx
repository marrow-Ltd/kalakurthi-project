import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import api from "../api/axios";
import Reveal from "../components/Reveal";
import { CategoryIcon } from "../components/CategoryCircles";
import { optimizeImage } from "../utils/format";

// Big tappable category cards — text on the left, picture on the right
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 lg:py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-plum mb-5 animate-slideLeft">Categories</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-32 sm:h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((c, i) => (
            <Reveal key={c._id} variant="left" delay={Math.min(i, 6) * 70}>
              <Link
                to={`/shop?category=${c.slug}`}
                className="group relative flex items-center overflow-hidden rounded-2xl h-32 sm:h-40 px-6 sm:px-8 active:scale-[0.99] transition-transform"
                style={{ background: c.color || "#F6D9DC" }}
              >
                <div className="relative z-10 max-w-[60%]">
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-plum-dark">{c.name}</h2>
                  {c.tagline && <p className="text-sm text-plum-dark/70 mt-0.5">{c.tagline}</p>}
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-plum opacity-70 group-hover:opacity-100 transition-opacity">
                    Shop now <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
                <div className="absolute right-0 inset-y-0 w-[45%] flex items-center justify-center overflow-hidden">
                  {c.image ? (
                    <img
                      src={optimizeImage(c.image, 700)}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      style={{
                        WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 35%)",
                        maskImage: "linear-gradient(to right, transparent 0%, #000 35%)",
                      }}
                    />
                  ) : (
                    <CategoryIcon name={c.icon} size={80} className="text-plum/25 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" />
                  )}
                </div>
              </Link>
            </Reveal>
          ))}

          <Reveal variant="left" delay={Math.min(categories.length, 6) * 70}>
            <Link
              to="/shop"
              className="group flex items-center justify-between rounded-2xl h-20 px-6 sm:px-8 bg-plum text-cream active:scale-[0.99] transition-transform"
            >
              <span className="flex items-center gap-3 font-display text-xl font-semibold">
                <ShoppingBag size={22} /> Shop everything
              </span>
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      )}
    </div>
  );
};

export default Categories;
