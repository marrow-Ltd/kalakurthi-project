import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

// Rounded grey search bar (mobile home/header + desktop header). Submitting opens /shop?q=...
const SearchBar = ({ className = "", autoFocus = false }) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [value, setValue] = useState("");

  // Keep the box in sync with the ?q= on the shop page
  useEffect(() => {
    const q = pathname.startsWith("/shop") ? new URLSearchParams(search).get("q") || "" : "";
    setValue(q);
  }, [pathname, search]);

  const submit = (e) => {
    e.preventDefault();
    const q = value.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    e.target.querySelector("input")?.blur();
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className={`flex items-center gap-2 bg-plum/[0.06] hover:bg-plum/[0.09] focus-within:bg-white focus-within:ring-2 focus-within:ring-terracotta/40 rounded-xl px-3.5 h-11 transition-all duration-300 ${className}`}
    >
      <Search size={19} className="text-plum-dark/50 shrink-0" />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search embroidery, crochet & more"
        aria-label="Search products"
        className="flex-1 min-w-0 bg-transparent outline-none text-sm text-plum-dark placeholder:text-plum-dark/45 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" onClick={() => setValue("")} aria-label="Clear search" className="text-plum-dark/40 hover:text-plum">
          <X size={16} />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
