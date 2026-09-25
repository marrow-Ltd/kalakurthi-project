import { splitBrand } from "../utils/format";
import { useSiteConfig } from "../context/SiteConfigContext";

// "Kalakruti Artistry" -> first word in the main colour, the rest in terracotta.
const BrandName = ({ className = "", firstClass = "", restClass = "text-terracotta" }) => {
  const { brandName } = useSiteConfig();
  const [first, rest] = splitBrand(brandName);
  return (
    <span className={className}>
      <span className={firstClass}>{first}</span>
      {rest && <span className={restClass}> {rest}</span>}
    </span>
  );
};

export default BrandName;
