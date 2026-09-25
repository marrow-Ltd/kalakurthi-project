import { useEffect, useState } from "react";
import { Plus, Minus, Check } from "lucide-react";
import { formatPrice } from "../utils/format";

const DISCOUNTS = [10, 20, 30, 50];
const PRICE_PRESETS = [
  { label: "Under ₹500", min: "", max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹2,500", min: 1000, max: 2500 },
  { label: "Above ₹2,500", min: 2500, max: "" },
];

// One collapsible block with a + / − toggle
const Section = ({ title, open, onToggle, children }) => (
  <div className="border-b border-plum/10">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center justify-between py-4 text-left text-[15px] text-plum-dark hover:text-terracotta transition-colors"
    >
      {title}
      {open ? <Minus size={18} /> : <Plus size={18} />}
    </button>
    <div className={`accordion ${open ? "open" : ""}`}>
      <div>
        <div className="pb-4 space-y-1.5">{children}</div>
      </div>
    </div>
  </div>
);

const CheckRow = ({ checked, onChange, label, count }) => (
  <button type="button" onClick={onChange} role="checkbox" aria-checked={checked} className="w-full flex items-center gap-3 py-1.5 text-left group">
    <span
      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 ${
        checked ? "bg-plum border-plum scale-105" : "border-plum/25 bg-white group-hover:border-terracotta"
      }`}
    >
      {checked && <Check size={14} className="text-white animate-popIn" strokeWidth={3} />}
    </span>
    <span className="text-sm text-plum-dark flex-1">{label}</span>
    {count !== undefined && <span className="text-xs text-plum-dark/40">{count}</span>}
  </button>
);

const PriceFilter = ({ filters, onSet, facets }) => {
  const [min, setMin] = useState(filters.minPrice);
  const [max, setMax] = useState(filters.maxPrice);

  useEffect(() => {
    setMin(filters.minPrice);
    setMax(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  const inputCls = "w-full px-3 py-2 rounded-lg border border-plum/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRICE_PRESETS.map((p) => {
          const active = String(filters.minPrice) === String(p.min) && String(filters.maxPrice) === String(p.max);
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onSet(active ? { minPrice: "", maxPrice: "" } : { minPrice: p.min, maxPrice: p.max })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active ? "bg-plum text-cream border-plum" : "bg-white text-plum-dark border-plum/15 hover:border-terracotta"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <input type="number" min="0" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} placeholder="Min ₹" className={inputCls} />
        <span className="text-plum-dark/40">–</span>
        <input type="number" min="0" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} placeholder="Max ₹" className={inputCls} />
      </div>
      <button type="button" onClick={() => onSet({ minPrice: min, maxPrice: max })} className="btn-secondary !py-1.5 !px-4 !text-sm w-full">
        Apply price
      </button>
      {facets?.price?.max > 0 && (
        <p className="text-xs text-plum-dark/40">
          Our range: {formatPrice(facets.price.min)} – {formatPrice(facets.price.max)}
        </p>
      )}
    </div>
  );
};

/**
 * Filter blocks (Category, Price, Discount, Colour, Availability).
 * `filters` is the parsed URL state; `onToggle(key, value)` flips one value of a multi-select,
 * `onSet(patch)` sets plain URL params.
 */
const FilterPanel = ({ facets, filters, onToggle, onSet }) => {
  const [open, setOpen] = useState({ category: true, price: false, discount: false, color: false, availability: false });
  const flip = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  if (!facets) {
    return (
      <div className="space-y-4 py-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-8 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <Section title="Category" open={open.category} onToggle={() => flip("category")}>
        {facets.categories.length === 0 && <p className="text-sm text-plum-dark/40">No categories yet.</p>}
        {facets.categories.map((c) => (
          <CheckRow key={c._id} label={c.name} count={c.count} checked={filters.categories.includes(c.slug)} onChange={() => onToggle("category", c.slug)} />
        ))}
      </Section>

      <Section title="Price" open={open.price} onToggle={() => flip("price")}>
        <PriceFilter filters={filters} onSet={onSet} facets={facets} />
      </Section>

      <Section title="Discount" open={open.discount} onToggle={() => flip("discount")}>
        {DISCOUNTS.map((d) => (
          <CheckRow
            key={d}
            label={`${d}% and above`}
            checked={String(filters.discount) === String(d)}
            onChange={() => onSet({ discount: String(filters.discount) === String(d) ? "" : d })}
          />
        ))}
        <CheckRow label="Only items on offer" checked={filters.offers} onChange={() => onSet({ offers: filters.offers ? "" : "true" })} />
      </Section>

      <Section title="Colour" open={open.color} onToggle={() => flip("color")}>
        {facets.colors.length === 0 && <p className="text-sm text-plum-dark/40">No colours listed yet.</p>}
        {facets.colors.map((c) => (
          <CheckRow key={c} label={c} checked={filters.colors.some((x) => x.toLowerCase() === c.toLowerCase())} onChange={() => onToggle("color", c)} />
        ))}
      </Section>

      <Section title="Availability" open={open.availability} onToggle={() => flip("availability")}>
        <CheckRow label="In stock only" checked={filters.inStock} onChange={() => onSet({ inStock: filters.inStock ? "" : "true" })} />
      </Section>
    </div>
  );
};

export default FilterPanel;
