import WhatsAppButton from "./components/WhatsAppButton";

// Static showcase cards. Drop matching photos into /public/images/ or swap in Cloudinary URLs.
// Each card carries a one-click "Inquire on WhatsApp" CTA with the product name pre-filled.
const products = [
  { name: "Crochet Scrunchies", image: "/images/scrunchie.jpg" },
  { name: "Hand Embroidery", image: "/images/embroidery.jpg" },
  { name: "Crochet Keychains", image: "/images/keychain.jpg" },
  { name: "Handmade Flowers", image: "/images/flowers.jpg" },
];

export const ProductCard = ({ name, image }) => (
  <div className="craft-card stitched p-4 flex flex-col text-center">
    <div className="h-56 rounded-xl overflow-hidden bg-beige mb-4">
      <img
        src={image}
        alt={name}
        loading="lazy"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.visibility = "hidden";
        }}
      />
    </div>
    <h3 className="font-display text-lg text-plum font-semibold mb-4 flex-1">{name}</h3>
    <WhatsAppButton itemName={name} className="w-full" />
  </div>
);

function Products() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h2 className="font-display text-3xl sm:text-4xl text-plum font-semibold mb-2">Our Handmade Collection</h2>
      <p className="text-plum-dark/70 mb-10">Beautiful handmade creations, stitched with love.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.name} {...product} />
        ))}
      </div>
    </section>
  );
}

export default Products;
