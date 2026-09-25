import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { optimizeImage } from "../utils/format";

// Layout classes per size. "responsive" adapts to the screen; "phone" is fixed (used for admin previews).
const SIZES = {
  responsive: {
    pad: "px-5 sm:px-10 lg:px-16",
    text: "w-[58%] sm:w-1/2 lg:w-[45%]",
    title: "text-2xl sm:text-4xl lg:text-5xl",
    sub: "text-sm sm:text-lg",
    img: "w-[46%] sm:w-1/2 lg:w-[52%]",
    cta: "px-5 py-2.5 text-sm sm:px-7 sm:py-3 sm:text-base",
  },
  phone: {
    pad: "px-5",
    text: "w-[58%]",
    title: "text-2xl",
    sub: "text-sm",
    img: "w-[46%]",
    cta: "px-5 py-2.5 text-sm",
  },
};

export const SlideCta = ({ slide, className = "" }) => {
  const link = slide.ctaLink || "/shop";
  const content = (
    <>
      {slide.ctaText || "Shop Now"} <ArrowRight size={16} />
    </>
  );
  return link.startsWith("/") ? (
    <Link to={link} className={className}>
      {content}
    </Link>
  ) : (
    <a href={link} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  );
};

/** The artwork of one slide. Fills its parent (parent must be `relative` with a height). */
export const SlideContent = ({ slide, size = "responsive", asLink = true }) => {
  const s = SIZES[size];
  const dark = slide.textTheme === "dark";
  const ctaClass = `slide-anim btn-shine inline-flex items-center gap-2 rounded-full font-semibold shadow-card transition-transform active:scale-95 ${s.cta} ${
    dark ? "bg-plum text-cream" : "bg-white text-plum"
  }`;

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${dark ? "text-plum-dark" : "text-cream"}`}
      style={{ background: `linear-gradient(120deg, ${slide.bgFrom || "#6A1B38"}, ${slide.bgTo || "#C86D51"})` }}
    >
      {/* stitched-thread decorations */}
      <svg className="absolute -left-20 -bottom-24 w-72 h-72 opacity-25 slide-float" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" />
      </svg>
      <svg className="absolute right-1/3 -top-24 w-56 h-56 opacity-20 slide-float" style={{ animationDelay: "1.2s" }} viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" />
      </svg>

      {/* picture (right side) */}
      <div className={`absolute right-0 inset-y-0 ${s.img}`}>
        {slide.image ? (
          <img
            src={optimizeImage(slide.image, 900)}
            alt=""
            className="slide-img w-full h-full object-cover object-center"
            style={{
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 38%)",
              maskImage: "linear-gradient(to right, transparent 0%, #000 38%)",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-30">
            <Sparkles className="slide-float" size={size === "phone" ? 72 : 110} />
          </div>
        )}
      </div>

      {/* words (left side) */}
      <div className={`relative h-full max-w-7xl mx-auto flex items-center ${s.pad}`}>
        <div className={s.text}>
          {slide.badge && (
            <span
              className="slide-anim inline-block text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded-full bg-white/25 backdrop-blur-sm mb-3"
              style={{ "--d": "100ms" }}
            >
              {slide.badge}
            </span>
          )}
          <h2 className={`slide-anim font-display font-semibold leading-[1.1] mb-3 ${s.title}`} style={{ "--d": "250ms" }}>
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className={`slide-anim mb-5 opacity-90 line-clamp-3 ${s.sub}`} style={{ "--d": "400ms" }}>
              {slide.subtitle}
            </p>
          )}
          <span className="slide-anim inline-block" style={{ "--d": "550ms" }}>
            {asLink ? (
              <SlideCta slide={slide} className={ctaClass.replace("slide-anim ", "")} />
            ) : (
              <span className={ctaClass.replace("slide-anim ", "")}>
                {slide.ctaText || "Shop Now"} <ArrowRight size={16} />
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

const AUTOPLAY_MS = 5500;

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);
  return reduced;
};

/** Auto-playing, swipeable banner slider (Ken Burns image zoom, staggered text, progress dashes). */
const HeroSlider = ({ slides }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef(null);
  const reduced = usePrefersReducedMotion();
  const count = slides.length;

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  // If slides are removed in the admin while someone is viewing, stay in range
  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
    setPaused(true);
  };
  const onTouchEnd = (e) => {
    const start = touch.current;
    touch.current = null;
    setPaused(false);
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      className="max-w-7xl mx-auto lg:px-8 lg:pt-4"
      aria-roledescription="carousel"
      aria-label="Featured banners"
    >
      <div
        className="relative h-[300px] sm:h-[380px] lg:h-[470px] overflow-hidden lg:rounded-3xl lg:shadow-soft select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((slide, i) => (
          <div
            key={slide._id || i}
            className={`hero-slide absolute inset-0 ${i === index ? "is-active" : ""}`}
            aria-hidden={i !== index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            <SlideContent slide={slide} />
          </div>
        ))}

        {count > 1 && (
          <>
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous banner"
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/70 hover:bg-white text-plum items-center justify-center shadow-card transition-all hover:scale-110"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Next banner"
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/70 hover:bg-white text-plum items-center justify-center shadow-card transition-all hover:scale-110"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* progress dashes under the banner; the active one fills up and then advances the slide */}
      {count > 1 && (
        <div className="flex justify-center gap-2 pt-3" role="tablist" aria-label="Choose banner">
          {slides.map((slide, i) => {
            const active = i === index;
            return (
              <button
                key={slide._id || i}
                role="tab"
                aria-selected={active}
                aria-label={`Go to banner ${i + 1}`}
                onClick={() => go(i)}
                className={`relative h-1.5 rounded-full overflow-hidden bg-plum/15 transition-all duration-500 ${active ? "w-10" : "w-5 hover:bg-plum/30"}`}
              >
                {active && (
                  <span
                    key={index}
                    className={`progress-fill absolute inset-0 bg-terracotta rounded-full ${paused ? "paused" : ""}`}
                    style={{ "--dur": `${AUTOPLAY_MS}ms`, ...(reduced ? { animation: "none", transform: "none" } : {}) }}
                    onAnimationEnd={() => count > 1 && !reduced && go(index + 1)}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
