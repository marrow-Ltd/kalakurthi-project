import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown, LayoutGrid, Loader2, PackageSearch, Square, SlidersHorizontal, X } from "lucide-react";
import api from "../api/axios";
import Portal from "../components/Portal";
import Reveal from "../components/Reveal";
import FilterPanel from "../components/FilterPanel";
import ProductCard from "../components/ProductCard";
import WhatsAppButton from "../components/WhatsAppButton";
import { formatPrice } from "../utils/format";

const PAGE_SIZE = 12;
const SORTS = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount", label: "Discount" },
];

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const [facets, setFacets] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cols, setCols] = useState(() => {
    try {
      return localStorage.getItem("kalakruti_shop_cols") === "1" ? 1 : 2;
    } catch {
      return 2;
    }
  });

  const pick = (k) => params.get(k) || "";
  const list = (k) => (pick(k) ? pick(k).split(",").filter(Boolean) : []);
  const filters = {
    q: pick("q"),
    categories: list("category"),
    colors: list("color"),
    minPrice: pick("minPrice"),
    maxPrice: pick("maxPrice"),
    discount: pick("discount"),
    offers: pick("offers") === "true",
    inStock: pick("inStock") === "true",
    sort: pick("sort") || "popular",
  };

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === "" || v === null || v === undefined || v === false) next.delete(k);
      else next.set(k, String(v));
    });
    setParams(next, { replace: true });
  };
  const toggleMulti = (key, value) => {
    const cur = list(key);
    const next = cur.some((v) => v.toLowerCase() === value.toLowerCase())
      ? cur.filter((v) => v.toLowerCase() !== value.toLowerCase())
      : [...cur, value];
    update({ [key]: next.join(",") });
  };
  const clearAll = () => setParams(filters.sort !== "popular" ? { sort: filters.sort } : {}, { replace: true });

  useEffect(() => {
    api.get("/products/filters").then(({ data }) => setFacets(data)).catch(() => {});
  }, []);

  const queryKey = params.toString();
  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get("/products", { params: { ...Object.fromEntries(params), limit: PAGE_SIZE, page: 1 } })
      .then(({ data }) => {
        if (!alive) return;
        setItems(data.items);
        setTotal(data.total);
        setPage(1);
        setPages(data.pages);
      })
      .catch(() => alive && (setItems([]), setTotal(0), setPages(1)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // params is fully described by queryKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const { data } = await api.get("/products", { params: { ...Object.fromEntries(params), limit: PAGE_SIZE, page: page + 1 } });
      setItems((prev) => [...prev, ...data.items.filter((p) => !prev.some((x) => x._id === p._id))]);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      /* keep what we have */
    } finally {
      setLoadingMore(false);
    }
  };

  const setView = (n) => {
    setCols(n);
    try {
      localStorage.setItem("kalakruti_shop_cols", String(n));
    } catch {
      /* ignore */
    }
  };

  const catName = (slug) => facets?.categories.find((c) => c.slug === slug)?.name || slug;

  const chips = [];
  if (filters.q) chips.push({ key: "q", label: `“${filters.q}”`, remove: () => update({ q: "" }) });
  filters.categories.forEach((s) => chips.push({ key: `c-${s}`, label: catName(s), remove: () => toggleMulti("category", s) }));
  filters.colors.forEach((c) => chips.push({ key: `col-${c}`, label: c, remove: () => toggleMulti("color", c) }));
  if (filters.minPrice || filters.maxPrice) {
    chips.push({
      key: "price",
      label: `${filters.minPrice ? formatPrice(filters.minPrice) : "₹0"} – ${filters.maxPrice ? formatPrice(filters.maxPrice) : "any"}`,
      remove: () => update({ minPrice: "", maxPrice: "" }),
    });
  }
  if (filters.discount) chips.push({ key: "disc", label: `${filters.discount}% & above`, remove: () => update({ discount: "" }) });
  if (filters.offers) chips.push({ key: "offers", label: "On offer", remove: () => update({ offers: "" }) });
  if (filters.inStock) chips.push({ key: "stock", label: "In stock", remove: () => update({ inStock: "" }) });

  const heading = useMemo(() => {
    if (filters.q) return "Search results";
    if (filters.categories.length === 1) return catName(filters.categories[0]);
    if (filters.offers && chips.length === 1) return "Offers";
    return "All Products";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, facets]);

  const gridCls = cols === 1 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";

  return (
    <div>
      {/* sticky toolbar: Filters · Sort · grid toggle */}
      <div className="sticky top-16 lg:top-20 z-30 bg-cream/95 backdrop-blur-md border-b border-plum/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <button
            onClick={() => setSheetOpen(true)}
            className="md:hidden flex items-center gap-2 text-sm font-medium text-plum-dark bg-white border border-plum/10 rounded-lg px-3 py-2 active:scale-95 transition-transform"
          >
            <SlidersHorizontal size={16} /> Filters
            {chips.length > 0 && <span className="bg-terracotta text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">{chips.length}</span>}
          </button>

          <label className="flex items-center gap-2 text-sm text-plum-dark/70 ml-auto md:ml-0">
            <span className="hidden sm:inline">Sort by:</span>
            <span className="relative">
              <select
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value === "popular" ? "" : e.target.value })}
                className="appearance-none bg-white border border-plum/10 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-plum-dark focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-plum-dark/50" />
            </span>
          </label>

          <div className="md:ml-auto flex items-center gap-1" role="group" aria-label="Grid size">
            <button onClick={() => setView(1)} aria-label="One column" aria-pressed={cols === 1} className={`p-2 rounded-lg transition-colors ${cols === 1 ? "bg-plum text-cream" : "text-plum-dark/50 hover:bg-plum/10"}`}>
              <Square size={18} />
            </button>
            <button onClick={() => setView(2)} aria-label="Grid" aria-pressed={cols === 2} className={`p-2 rounded-lg transition-colors ${cols === 2 ? "bg-plum text-cream" : "text-plum-dark/50 hover:bg-plum/10"}`}>
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex gap-8 items-start">
        <aside className="hidden md:block w-56 lg:w-64 shrink-0 sticky top-36 lg:top-40 max-h-[calc(100vh-11rem)] overflow-y-auto pr-1 no-scrollbar">
          <h2 className="font-display text-lg text-plum font-semibold mb-1">Filters</h2>
          <FilterPanel facets={facets} filters={filters} onToggle={toggleMulti} onSet={update} />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-end justify-between mb-3">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-plum animate-slideLeft">{heading}</h1>
            <p className="text-sm text-plum-dark/50">{loading ? "…" : `${total} item${total === 1 ? "" : "s"}`}</p>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  onClick={chip.remove}
                  className="animate-popIn flex items-center gap-1.5 text-sm bg-white border border-plum/20 rounded-md px-2.5 py-1 text-plum-dark hover:border-terracotta transition-colors"
                >
                  {chip.label} <X size={14} className="text-plum-dark/50" />
                </button>
              ))}
              <button onClick={clearAll} className="text-sm font-medium text-plum underline underline-offset-4 hover:text-terracotta ml-1">
                Clear All
              </button>
            </div>
          )}

          {loading ? (
            <div className={`grid ${gridCls} gap-4`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton aspect-[3/4.6] rounded-2xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-blush/40 text-plum flex items-center justify-center mx-auto mb-4">
                <PackageSearch size={34} />
              </div>
              <h2 className="font-display text-xl text-plum font-semibold mb-2">No products found</h2>
              <p className="text-plum-dark/60 mb-6 max-w-sm mx-auto">Try removing a filter — or tell us what you're looking for and we'll make it for you.</p>
              <div className="flex flex-wrap justify-center gap-3">
                {chips.length > 0 && (
                  <button onClick={clearAll} className="btn-primary">
                    Clear filters
                  </button>
                )}
                <WhatsAppButton itemName={filters.q || "a custom piece"} label="Ask on WhatsApp" />
                <Link to="/custom-order" className="btn-secondary">
                  Custom order
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className={`grid ${gridCls} gap-4`}>
                {items.map((p, i) => (
                  <Reveal key={p._id} delay={(i % PAGE_SIZE) * 40}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>

              {page < pages && (
                <div className="text-center mt-8">
                  <button onClick={loadMore} disabled={loadingMore} className="btn-secondary">
                    {loadingMore ? <Loader2 className="animate-spin" size={18} /> : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* phone filter sheet */}
      {sheetOpen && (
        <Portal>
          <div className="md:hidden fixed inset-0 z-[70] flex items-end animate-fadeIn">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSheetOpen(false)} />
            <div className="relative bg-cream w-full rounded-t-3xl max-h-[88vh] flex flex-col animate-sheetUp">
              <div className="flex items-center justify-between px-5 py-4 border-b border-plum/10">
                <h2 className="font-display text-xl text-plum font-semibold">Filters</h2>
                <div className="flex items-center gap-4">
                  {chips.length > 0 && (
                    <button onClick={clearAll} className="text-sm font-medium text-terracotta">
                      Clear all
                    </button>
                  )}
                  <button onClick={() => setSheetOpen(false)} aria-label="Close filters">
                    <X size={22} />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto px-5 flex-1">
                <FilterPanel facets={facets} filters={filters} onToggle={toggleMulti} onSet={update} />
              </div>
              <div className="p-4 border-t border-plum/10" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
                <button onClick={() => setSheetOpen(false)} className="btn-primary w-full">
                  {loading ? "Updating…" : `Show ${total} item${total === 1 ? "" : "s"}`}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default Shop;
