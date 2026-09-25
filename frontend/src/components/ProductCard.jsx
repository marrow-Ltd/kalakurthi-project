import { Link } from "react-router-dom";
import { Heart, Scissors } from "lucide-react";
import WhatsAppButton from "./WhatsAppButton";
import { useWishlist } from "../context/WishlistContext";
import { formatPrice, optimizeImage } from "../utils/format";

// Shopping-app style card: photo + heart, centred category/name/price, one-tap WhatsApp inquiry
const ProductCard = ({ product }) => {
  const { has, toggle } = useWishlist();
  const liked = has(product._id);
  const [first, second] = product.images || [];
  const showMrp = product.mrp > product.price;

  return (
    <div className="product-card group bg-white rounded-2xl overflow-hidden border border-plum/5 flex flex-col h-full">
      <div className="relative aspect-[3/4] bg-beige overflow-hidden">
        <Link to={`/product/${product.slug}`} className="block w-full h-full" aria-label={product.name}>
          {first ? (
            <img
              src={optimizeImage(first.url, 500)}
              alt={product.name}
              loading="lazy"
              className="p-img p-img-main absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blush/40 to-beige text-plum/25">
              <Scissors size={44} />
            </div>
          )}
          {second && (
            <img
              src={optimizeImage(second.url, 500)}
              alt=""
              loading="lazy"
              className="p-img absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100"
            />
          )}
        </Link>

        {product.discountPercent > 0 && product.isAvailable && (
          <span className="absolute top-2.5 left-2.5 bg-terracotta text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {product.discountPercent}% OFF
          </span>
        )}
        {!product.isAvailable && (
          <span className="absolute bottom-2.5 left-2.5 bg-plum-dark/85 text-cream text-[11px] font-medium px-2.5 py-1 rounded-full">
            Out of stock
          </span>
        )}

        <button
          onClick={() => toggle(product._id)}
          aria-pressed={liked}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          className={`heart-btn ${liked ? "is-liked" : ""} absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-card active:scale-90 transition-transform`}
        >
          <Heart size={18} className={liked ? "fill-terracotta text-terracotta" : "text-plum-dark/70"} />
        </button>
      </div>

      <div className="p-3 text-center flex-1 flex flex-col">
        {product.category?.name && (
          <p className="text-[10px] tracking-[0.18em] uppercase text-terracotta font-semibold mb-0.5 truncate">
            {product.category.name}
          </p>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display text-[15px] text-plum font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-baseline justify-center gap-2 flex-wrap">
          <span className="font-semibold text-plum-dark">{formatPrice(product.price)}</span>
          {showMrp && <span className="text-xs text-plum-dark/40 line-through">{formatPrice(product.mrp)}</span>}
        </div>
        <div className="mt-auto pt-3">
          <WhatsAppButton itemName={product.name} label="Inquire" className="w-full !text-xs !py-2 !px-3" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
