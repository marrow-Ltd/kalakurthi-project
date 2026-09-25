import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Hand, MessageCircle, Palette, Heart } from "lucide-react";
import api from "../api/axios";
import { useSiteConfig } from "../context/SiteConfigContext";
import AnnouncementBanner from "../components/AnnouncementBanner";
import HeroSlider from "../components/HeroSlider";
import CategoryCircles from "../components/CategoryCircles";
import ProductRail from "../components/ProductRail";
import ServicesSection from "../components/ServicesSection";
import GallerySection from "../components/GallerySection";
import Testimonials from "../components/Testimonials";
import Reveal from "../components/Reveal";

const perks = [
  { icon: Hand, label: "100% Handmade" },
  { icon: Palette, label: "Custom colours" },
  { icon: MessageCircle, label: "Easy WhatsApp orders" },
  { icon: Heart, label: "Made with love" },
];

const Home = () => {
  const { config, brandName } = useSiteConfig();
  const [slides, setSlides] = useState(null);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [featured, setFeatured] = useState([]);
  const [featuredTitle, setFeaturedTitle] = useState("Trending Now");
  const [offers, setOffers] = useState([]);
  const [prodLoading, setProdLoading] = useState(true);

  useEffect(() => {
    api.get("/slides").then(({ data }) => setSlides(data)).catch(() => setSlides([]));
    api.get("/categories").then(({ data }) => setCategories(data)).catch(() => {}).finally(() => setCatLoading(false));

    (async () => {
      try {
        const [feat, off] = await Promise.all([
          api.get("/products", { params: { featured: true, limit: 10 } }),
          api.get("/products", { params: { offers: true, sort: "discount", limit: 10 } }),
        ]);
        let list = feat.data.items;
        if (list.length === 0) {
          // nothing marked as featured yet — show the newest products instead
          const latest = await api.get("/products", { params: { sort: "newest", limit: 10 } });
          list = latest.data.items;
          setFeaturedTitle("New Arrivals");
        }
        setFeatured(list);
        setOffers(off.data.items);
      } catch {
        /* rails simply stay empty */
      } finally {
        setProdLoading(false);
      }
    })();
  }, []);

  // If the admin hasn't made any slides yet, build one from the Site Settings hero fields
  const displaySlides = useMemo(() => {
    if (slides === null) return null;
    if (slides.length > 0) return slides;
    return [
      {
        _id: "default",
        title: config?.heroTitle || "Threads That Tell Your Story",
        subtitle: config?.heroTagline || "Hand-embroidered & crocheted keepsakes, stitched with love in every loop.",
        badge: "Handcrafted, thread by thread",
        ctaText: config?.heroCtaText || "Shop Now",
        ctaLink: "/shop",
        image: config?.heroImage || "",
        bgFrom: "#6A1B38",
        bgTo: "#C86D51",
        textTheme: "light",
      },
    ];
  }, [slides, config]);

  return (
    <div>
      <AnnouncementBanner config={config} />

      {displaySlides ? (
        <HeroSlider slides={displaySlides} />
      ) : (
        <div className="max-w-7xl mx-auto lg:px-8 lg:pt-4">
          <div className="skeleton h-[300px] sm:h-[380px] lg:h-[470px] lg:rounded-3xl" />
        </div>
      )}

      <CategoryCircles categories={categories} loading={catLoading} />

      {/* trust strip */}
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {perks.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 bg-white/70 border border-dashed border-terracotta/35 rounded-xl px-3 py-2.5">
              <Icon size={18} className="text-terracotta shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-plum-dark">{label}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <ProductRail eyebrow="Loved by customers" title={featuredTitle} to="/shop" products={featured} loading={prodLoading} />
      <ProductRail eyebrow="Limited time" title="Best Offers" to="/shop?offers=true" products={offers} loading={false} />

      <ServicesSection />
      <GallerySection preview limit={6} />
      <Testimonials />

      {config?.instagramUrl && (
        <section className="bg-gradient-to-r from-plum to-plum-light text-cream py-16 text-center overflow-hidden">
          <Reveal variant="zoom" className="max-w-2xl mx-auto px-4">
            <Instagram className="mx-auto mb-4 text-gold animate-bounceSoft" size={36} />
            <h3 className="font-display text-2xl sm:text-3xl font-semibold mb-3">Follow our stitching journey</h3>
            <p className="text-cream/80 mb-6">See daily behind-the-scenes, new drops, and works-in-progress on Instagram.</p>
            <a href={config.instagramUrl} target="_blank" rel="noreferrer" className="btn-gold btn-shine">
              {config.instagramHandle}
            </a>
          </Reveal>
        </section>
      )}

      <section className="py-20 text-center">
        <Reveal className="max-w-2xl mx-auto px-4">
          <h3 className="font-display text-2xl sm:text-3xl text-plum font-semibold mb-3">Have something special in mind?</h3>
          <p className="text-plum-dark/70 mb-6">Share your idea and {brandName} will bring it to life, one stitch at a time.</p>
          <Link to="/custom-order" className="btn-primary btn-shine">
            Start a Custom Order
          </Link>
        </Reveal>
      </section>
    </div>
  );
};

export default Home;
