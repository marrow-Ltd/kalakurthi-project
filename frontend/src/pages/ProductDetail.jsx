import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, ChevronRight, Heart, Scissors, Share2, Hand, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useWishlist } from "../context/WishlistContext";
import WhatsAppButton from "../components/WhatsAppButton";
import ProductRail from "../components/ProductRail";
import { formatPrice, optimizeImage } from "../utils/format";

const ProductDetail = () => {
  const { slug } = useParams();
  const { has, toggle } = useWishlist();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [active, setActive] = useState(0);
  const [related, setRelated] = useState([]);
  const touch = useRef(null);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    setActive(0);
    setRelated([]);
    api
      .get(`/products/${slug}`)
      .then(({ data }) => {
        if (!alive) return;
        setProduct(data);
        setStatus("ready");
        if (data.category?.slug) {
          api
            .get("/products", { params: { category: data.category.slug, limit: 9 } })
            .then((res) => alive && setRelated(res.data.items.filter((p) => p._id !== data._id).slice(0, 8)))
            .catch(() => {});
        }
      })
      .catch(() => alive && setStatus("missing"));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (status === "loading") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-8">
        <div className="skeleton aspect-[4/5] rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4 rounded-lg" />
          <div className="skeleton h-6 w-1/3 rounded-lg" />
          <div className="skeleton h-32 rounded-lg" />
        </div>
      </div>
    );
  }

  if (status === "missing" || !product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <Scissors className="text-plum/20 mb-4" size={48} />
        <h1 className="font-display text-2xl text-plum font-semibold mb-2">This product isn't available</h1>
        <p className="text-plum-dark/60 mb-6">It may have been removed or hidden.</p>
        <Link to="/shop" className="btn-primary">Back to shop</Link>
      </div>
    );
  }

  const images = product.images || [];
  const liked = has(product._id);
  const showMrp = product.mrp > product.price;

  const go = (i) => images.length && setActive(((i % images.length) + images.length) % images.length);
  const onTouchStart = (e) => (touch.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touch.current === null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      }
    } catch {
      /* share dismissed */
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 lg:py-10">
      <nav className="flex items-center flex-wrap gap-1 text-xs text-plum-dark/50 mb-4" aria-label="Breadcrumb">
        <Link to="/shop" className="hover:text-terracotta">Shop</Link>
        {product.category && (
          <>
            <ChevronRight size={12} />
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-terracotta">{product.category.name}</Link>
          </>
        )}
        <ChevronRight size={12} />
        <span className="text-plum-dark/80 truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
        {/* photos: swipe on phones, thumbnails on larger screens */}
        <div className="animate-slideLeft">
          <div
            className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-beige"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {images.length ? (
              <div className="flex h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${active * 100}%)` }}>
                {images.map((img, i) => (
                  <img
                    key={img.publicId || img.url}
                    src={optimizeImage(img.url, 900)}
                    alt={`${product.name} — photo ${i + 1}`}
                    className="min-w-full h-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                    draggable={false}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blush/40 to-beige text-plum/25">
                <Scissors size={72} />
              </div>
            )}

            {product.discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-terracotta text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm animate-popIn">
                {product.discountPercent}% OFF
              </span>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 sm:hidden">
                {images.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-white" : "w-1.5 bg-white/60"}`} />
                ))}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="hidden sm:flex gap-2 mt-3 overflow-x-auto no-scrollbar">
              {images.map((img, i) => (
                <button
                  key={img.publicId || img.url}
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${i === active ? "border-terracotta scale-105" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={optimizeImage(img.url, 160)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="animate-slideRight">
          {product.category && (
            <p className="text-xs tracking-[0.2em] uppercase text-terracotta font-semibold mb-1">{product.category.name}</p>
          )}
          <h1 className="font-display text-3xl sm:text-4xl text-plum font-semibold leading-tight mb-3">{product.name}</h1>

          <div className="flex items-baseline flex-wrap gap-3 mb-1">
            <span className="text-3xl font-semibold text-plum-dark">{formatPrice(product.price)}</span>
            {showMrp && <span className="text-lg text-plum-dark/40 line-through">{formatPrice(product.mrp)}</span>}
            {product.discountPercent > 0 && <span className="text-sm font-semibold text-olive">{product.discountPercent}% off</span>}
          </div>

          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mb-5 ${product.isAvailable ? "bg-olive/15 text-olive" : "bg-red-100 text-red-600"}`}>
            {product.isAvailable ? <><Check size={13} /> In stock</> : "Currently out of stock"}
          </span>

          {product.colors?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium text-plum-dark mb-2">Available colours</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <span key={c} className="px-3 py-1.5 rounded-full border border-plum/20 bg-white text-sm text-plum-dark">{c}</span>
                ))}
              </div>
            </div>
          )}

          {product.description && (
            <div className="mb-6">
              <p className="text-sm font-medium text-plum-dark mb-2">About this piece</p>
              <p className="text-plum-dark/75 whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="flex gap-3 mb-6">
            <WhatsAppButton itemName={product.name} className="flex-1 !py-3.5 !text-base" />
            <button
              onClick={() => toggle(product._id)}
              aria-pressed={liked}
              aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
              className={`heart-btn ${liked ? "is-liked" : ""} w-12 h-12 rounded-full border border-plum/20 bg-white flex items-center justify-center active:scale-90 transition-transform`}
            >
              <Heart size={22} className={liked ? "fill-terracotta text-terracotta" : "text-plum-dark/70"} />
            </button>
            <button onClick={share} aria-label="Share" className="w-12 h-12 rounded-full border border-plum/20 bg-white flex items-center justify-center text-plum-dark/70 active:scale-90 transition-transform">
              <Share2 size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 bg-white/70 border border-dashed border-terracotta/35 rounded-xl px-3 py-2.5">
              <Hand size={18} className="text-terracotta shrink-0" /> Handmade with care
            </div>
            <div className="flex items-center gap-2 bg-white/70 border border-dashed border-terracotta/35 rounded-xl px-3 py-2.5">
              <MessageCircle size={18} className="text-terracotta shrink-0" /> Ask for custom colours or sizes
            </div>
          </div>

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-5">
              {product.tags.map((t) => (
                <Link key={t} to={`/shop?q=${encodeURIComponent(t)}`} className="text-xs bg-blush/30 text-plum px-2.5 py-1 rounded-full hover:bg-blush/60 transition-colors">
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="-mx-4 sm:mx-0 mt-6">
        <ProductRail
          eyebrow="You may also like"
          title={product.category ? `More from ${product.category.name}` : "More to explore"}
          to={product.category ? `/shop?category=${product.category.slug}` : "/shop"}
          products={related}
          loading={false}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
