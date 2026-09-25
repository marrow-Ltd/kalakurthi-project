import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import api from "../api/axios";
import Reveal from "./Reveal";

const Testimonials = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/testimonials").then(({ data }) => setItems(data)).catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <Reveal className="text-center max-w-2xl mx-auto mb-12">
        <span className="section-eyebrow justify-center flex">Kind Words</span>
        <h2 className="font-display text-3xl sm:text-4xl text-plum font-semibold">From Our Patrons</h2>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((t, idx) => (
          <Reveal key={t._id} delay={idx * 90} className="h-full">
          <div className="craft-card p-6 relative h-full">
            <Quote className="text-blush absolute top-5 right-5" size={28} />
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  className={i < t.rating ? "fill-gold text-gold" : "text-plum/10"}
                />
              ))}
            </div>
            <p className="text-plum-dark/80 text-sm mb-5 italic">"{t.message}"</p>
            <div className="flex items-center gap-3">
              {t.customerPhoto ? (
                <img src={t.customerPhoto} alt={t.customerName} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blush/40 flex items-center justify-center text-plum font-semibold">
                  {t.customerName.charAt(0)}
                </div>
              )}
              <span className="font-medium text-plum-dark text-sm">{t.customerName}</span>
            </div>
          </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
