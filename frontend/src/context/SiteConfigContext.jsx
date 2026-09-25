import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { DEFAULT_BRAND } from "../utils/format";

// Loads /site-config once for the whole app (brand name, WhatsApp number, socials...).
const SiteConfigContext = createContext({ config: null, brandName: DEFAULT_BRAND, refresh: () => {} });

export const SiteConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/site-config");
      setConfig(data);
    } catch {
      /* site still works with defaults */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const brandName = config?.brandName?.trim() || DEFAULT_BRAND;

  useEffect(() => {
    document.title = `${brandName} | Handcrafted Embroidery & Crochet`;
  }, [brandName]);

  const value = useMemo(() => ({ config, brandName, refresh }), [config, brandName, refresh]);
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
};

export const useSiteConfig = () => useContext(SiteConfigContext);
