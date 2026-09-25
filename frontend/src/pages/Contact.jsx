import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import WhatsAppIcon from "../components/WhatsAppIcon";
import Reveal from "../components/Reveal";
import useWhatsApp from "../hooks/useWhatsApp";
import { useSiteConfig } from "../context/SiteConfigContext";

const Contact = () => {
  const { config } = useSiteConfig();
  const wa = useWhatsApp();

  const items = [
    { icon: WhatsAppIcon, label: "WhatsApp", value: wa.display, href: wa.link() },
    { icon: Mail, label: "Email", value: config?.contactEmail, href: config?.contactEmail ? `mailto:${config.contactEmail}` : undefined },
    { icon: Phone, label: "Phone", value: config?.contactPhone, href: config?.contactPhone ? `tel:${config.contactPhone}` : undefined },
    { icon: MapPin, label: "Studio", value: config?.contactAddress },
    { icon: Instagram, label: "Instagram", value: config?.instagramHandle, href: config?.instagramUrl },
  ].filter((i) => i.value);

  return (
    <div className="py-16 px-4">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="section-eyebrow justify-center flex">We'd Love to Hear From You</span>
        <h1 className="font-display text-4xl text-plum font-semibold">Get in Touch</h1>
      </div>

      <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
        {items.map(({ icon: Icon, label, value, href }, i) => (
          <Reveal key={label} delay={i * 80} variant="zoom">
          <a
            href={href}
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="craft-card p-6 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-blush/40 flex items-center justify-center text-plum shrink-0">
              <Icon size={22} />
            </div>
            <div>
              <p className="text-xs text-plum-dark/50 uppercase tracking-wide">{label}</p>
              <p className="text-plum-dark font-medium">{value}</p>
            </div>
          </a>
          </Reveal>
        ))}
      </div>
    </div>
  );
};

export default Contact;
