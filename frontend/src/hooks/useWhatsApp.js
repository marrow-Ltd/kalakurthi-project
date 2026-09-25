import { useMemo } from "react";
import { useSiteConfig } from "../context/SiteConfigContext";
import {
  DEFAULT_WHATSAPP_NUMBER,
  buildWhatsAppLink,
  buildWhatsAppLinkWithText,
  formatWhatsAppNumber,
} from "../utils/whatsapp";

/** WhatsApp number + brand name come from Site Settings (falling back to the built-in defaults). */
const useWhatsApp = () => {
  const { config, brandName } = useSiteConfig();
  const number = (config?.whatsappNumber || "").replace(/\D/g, "") || DEFAULT_WHATSAPP_NUMBER;

  return useMemo(
    () => ({
      brandName,
      number,
      display: formatWhatsAppNumber(number),
      link: (itemName) => buildWhatsAppLink(itemName, brandName, number),
      linkWithText: (text) => buildWhatsAppLinkWithText(text, number),
    }),
    [brandName, number]
  );
};

export default useWhatsApp;
