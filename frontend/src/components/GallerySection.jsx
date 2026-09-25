import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Image as ImageIcon, ArrowRight } from "lucide-react";
import api from "../api/axios";
import Modal from "./Modal";
import WhatsAppButton from "./WhatsAppButton";
import Reveal from "./Reveal";

const GallerySection = ({ preview = false, limit = 6 }) => {
  const [items, setItems] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!preview) {
      api.get("/gallery/tags").then(({ data }) => setTags(data)).catch(() => {});
    }
  }, [preview]);

  useEffect(() => {
    setLoading(true);
    const params = !preview && activeTag !== "All" ? { tag: activeTag } : {};
    api
      .get("/gallery", { params })
      .then(({ data }) => setItems(preview ? data.slice(0, limit) : data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTag, preview, limit]);

  return (
    <section className={preview ? "bg-beige py-20" : "py-16"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <span className="section-eyebrow justify-center flex">Our Portfolio</span>
          <h2 className="font-display text-3xl sm:text-4xl text-plum font-semibold mb-4">Canvas Gallery</h2>
          <p className="text-plum-dark/70">A closer look at pieces stitched, looped, and framed by hand.</p>
        </Reveal>

        {!preview && tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {["All", ...tags].map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeTag === tag
                    ? "bg-plum text-cream"
                    : "bg-white text-plum-dark hover:bg-blush/40 border border-plum/10"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="skeleton h-72 rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-plum-dark/50 flex flex-col items-center gap-3 py-10">
            <ImageIcon size={32} className="text-plum/20" />
            Gallery items will appear here once added by the admin.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <Reveal key={item._id} variant="zoom" delay={(idx % 6) * 70} className="h-full">
              <div className="craft-card overflow-hidden group h-full">
                <div className="relative h-64 overflow-hidden cursor-zoom-in" onClick={() => setSelected(item)}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {item.isFeatured && (
                    <span className="absolute top-3 left-3 bg-gold text-plum-dark text-xs font-semibold px-3 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-plum font-semibold mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-plum-dark/70 mb-3 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.tags?.map((tag) => (
                      <span key={tag} className="text-xs bg-blush/30 text-plum px-2.5 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <WhatsAppButton itemName={item.title} className="w-full" />
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        )}

        {preview && (
          <div className="text-center mt-12">
            <Link to="/gallery" className="btn-secondary">
              View Full Gallery <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>

      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)} wide>
          <img src={selected.image} alt={selected.title} className="w-full max-h-[60vh] object-contain rounded-xl mb-4" />
          {selected.description && <p className="text-sm text-plum-dark/70 mb-4">{selected.description}</p>}
          <WhatsAppButton itemName={selected.title} className="w-full" />
        </Modal>
      )}
    </section>
  );
};

export default GallerySection;
