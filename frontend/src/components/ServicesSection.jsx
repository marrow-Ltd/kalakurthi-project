import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import api from "../api/axios";
import WhatsAppButton from "./WhatsAppButton";
import Reveal from "./Reveal";

const IconFor = ({ name, ...props }) => {
  const Icon = Icons[name] || Icons.Sparkles;
  return <Icon {...props} />;
};

const ServicesSection = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/services")
      .then(({ data }) => setServices(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <Reveal className="text-center max-w-2xl mx-auto mb-14">
        <span className="section-eyebrow justify-center flex">What We Craft</span>
        <h2 className="font-display text-3xl sm:text-4xl text-plum font-semibold mb-4">Our Services</h2>
        <p className="text-plum-dark/70">
          From a single hoop to a full canvas masterpiece — every piece is made to order, just for you.
        </p>
      </Reveal>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <p className="text-center text-plum-dark/50">Services will appear here once added by the admin.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <Reveal key={service._id} delay={idx * 90} className="h-full">
            <div className="craft-card p-6 flex flex-col h-full">
              <div className="w-14 h-14 rounded-full bg-blush/40 flex items-center justify-center mb-5 text-plum">
                <IconFor name={service.icon} size={26} />
              </div>
              {service.image && (
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-32 object-cover rounded-xl mb-4"
                />
              )}
              <h3 className="font-display text-xl text-plum font-semibold mb-2">{service.title}</h3>
              <p className="text-sm text-plum-dark/70 mb-4 flex-1">{service.description}</p>
              {service.features?.length > 0 && (
                <ul className="text-xs text-olive space-y-1 mb-4">
                  {service.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-olive" /> {f}
                    </li>
                  ))}
                </ul>
              )}
              <span className="text-sm font-semibold text-terracotta mb-4">{service.priceLabel}</span>
              <WhatsAppButton itemName={service.title} className="w-full" />
            </div>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
};

export default ServicesSection;
