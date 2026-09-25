import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import api from "../api/axios";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";

const Wishlist = () => {
  const { ids } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    api
      .get("/products", { params: { ids: ids.join(","), limit: 60 } })
      .then(({ data }) => setItems(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
    // reload only when the set of saved ids changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  // hearts that get un-toggled disappear right away
  const visible = items.filter((p) => ids.includes(p._id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-plum mb-1">Your Wishlist</h1>
      <p className="text-plum-dark/60 text-sm mb-6">Saved on this device. Tap a product's WhatsApp button when you're ready to order.</p>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton aspect-[3/4.6] rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-blush/40 text-plum flex items-center justify-center mx-auto mb-4 animate-popIn">
            <Heart size={34} />
          </div>
          <h2 className="font-display text-xl text-plum font-semibold mb-2">Nothing saved yet</h2>
          <p className="text-plum-dark/60 mb-6">Tap the heart on any product to keep it here.</p>
          <Link to="/shop" className="btn-primary">Browse the shop</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {visible.map((p, i) => (
            <Reveal key={p._id} delay={Math.min(i, 8) * 50}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
