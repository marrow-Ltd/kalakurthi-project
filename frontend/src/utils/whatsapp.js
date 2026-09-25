// WhatsApp helpers — every "Inquire" CTA in the app goes through here (see hooks/useWhatsApp.js).
import { DEFAULT_BRAND } from "./format";

const DEFAULT_NUMBER = "917013058527"; // +91 70130 58527

export const DEFAULT_WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || DEFAULT_NUMBER).replace(/\D/g, "");

const digits = (n) => String(n || "").replace(/\D/g, "");

/** Human-friendly display, e.g. "+91 70130 58527" */
export const formatWhatsAppNumber = (number = DEFAULT_WHATSAPP_NUMBER) => {
  const n = digits(number);
  if (n.length === 12 && n.startsWith("91")) return `+91 ${n.slice(2, 7)} ${n.slice(7)}`;
  return `+${n}`;
};

/** Pre-filled inquiry text for a product / service / gallery item */
export const buildInquiryMessage = (itemName, brand = DEFAULT_BRAND) =>
  itemName
    ? `Hi ${brand}! I'm interested in ${itemName}. Is this available?`
    : `Hi ${brand}! I'd like to know more about your handmade creations.`;

/** wa.me link with a fully custom message (URL-encoded) */
export const buildWhatsAppLinkWithText = (text, number = DEFAULT_WHATSAPP_NUMBER) =>
  `https://wa.me/${digits(number)}?text=${encodeURIComponent(text)}`;

/** wa.me link with the standard inquiry message */
export const buildWhatsAppLink = (itemName, brand = DEFAULT_BRAND, number = DEFAULT_WHATSAPP_NUMBER) =>
  buildWhatsAppLinkWithText(buildInquiryMessage(itemName, brand), number);
