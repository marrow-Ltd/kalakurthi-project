import { useEffect, useRef, useState } from "react";
import { SlideContent } from "../HeroSlider";

// Phone-sized (375×300) preview of a slide, scaled to fit whatever width it's given — exactly what visitors see on mobile.
const W = 375;
const H = 300;

const SlidePreview = ({ slide, className = "" }) => {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setScale(el.clientWidth / W);
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative w-full overflow-hidden rounded-xl ${className}`} style={{ height: H * scale }}>
      <div className="slide-static absolute top-0 left-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
        <SlideContent slide={slide} size="phone" asLink={false} />
      </div>
    </div>
  );
};

export default SlidePreview;
