import WhatsAppIcon from "./WhatsAppIcon";
import useWhatsApp from "../hooks/useWhatsApp";

/**
 * One-click "Inquire on WhatsApp" CTA.
 * <WhatsAppButton itemName="Crochet Scrunchies" />
 */
const WhatsAppButton = ({ itemName, label = "Inquire on WhatsApp", className = "", onClick }) => {
  const wa = useWhatsApp();
  return (
    <a
      href={wa.link(itemName)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`btn-whatsapp btn-shine ${className}`}
    >
      <WhatsAppIcon size={18} /> {label}
    </a>
  );
};

export default WhatsAppButton;
