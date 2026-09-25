import GallerySection from "../components/GallerySection";

const Gallery = () => {
  return (
    <div className="pt-10">
      <div className="text-center max-w-2xl mx-auto px-4 mb-4">
        <span className="section-eyebrow justify-center flex">Browse the Collection</span>
        <h1 className="font-display text-4xl text-plum font-semibold">Canvas Gallery</h1>
      </div>
      <GallerySection />
    </div>
  );
};

export default Gallery;
