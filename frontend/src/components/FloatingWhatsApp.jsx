import WhatsAppIcon from "./WhatsAppIcon";
import useWhatsApp from "../hooks/useWhatsApp";

// Sticky button on every public page. Sits above the mobile bottom tab bar.
const FloatingWhatsApp = () => {
  const wa = useWhatsApp();

  return (
    <a
      href={wa.link()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed z-40 right-4 bottom-[5.25rem] lg:right-6 lg:bottom-6 w-14 h-14 rounded-full bg-whatsapp text-white flex items-center justify-center shadow-soft hover:scale-110 active:scale-95 transition-transform duration-300"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <span className="absolute inset-0 rounded-full bg-whatsapp opacity-40 animate-ping" aria-hidden="true" />
      <WhatsAppIcon size={30} className="relative animate-bounceSoft" />
    </a>
  );
};

export default FloatingWhatsApp;
