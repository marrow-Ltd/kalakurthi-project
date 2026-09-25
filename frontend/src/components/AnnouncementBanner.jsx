import { useState } from "react";
import { Megaphone, X } from "lucide-react";

// Scrolling ticker (pauses on hover; static for people who prefer reduced motion)
const AnnouncementBanner = ({ config }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!config?.announcementIsActive || !config?.announcementText || dismissed) return null;

  return (
    <div className="bg-terracotta text-cream text-sm">
      <div className="max-w-7xl mx-auto pl-4 pr-3 py-2 flex items-center gap-3">
        <Megaphone size={16} className="shrink-0" />
        <div className="overflow-hidden flex-1">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="px-8" aria-hidden={i > 0}>
                {config.announcementText}
              </span>
            ))}
          </div>
        </div>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss announcement" className="shrink-0 hover:opacity-70 transition-opacity">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
