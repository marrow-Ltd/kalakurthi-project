import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, ShoppingBag, Search, Star } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import ImagePicker from "../../components/admin/ImagePicker";
import { formatPrice } from "../../utils/format";

const input = "w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40";
const label = "text-sm font-medium text-plum-dark block mb-1.5";
const MAX_IMAGES = 6;

const emptyForm = {
  name: "", description: "", category: "", price: "", mrp: "", colors: "", tags: "",
  isAvailable: true, isFeatured: false, isVisible: true,
};

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [keptExisting, setKeptExisting] = useState([]);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const load = async () => {
    try {
      const [p, c] = await Promise.all([api.get("/products/all"), api.get("/categories/all")]);
      setProducts(p.data);
      setCategories(c.data);
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFiles([]);
    setKeptExisting([]);
    setModalOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || "",
      category: p.category?._id || "",
      price: p.price,
      mrp: p.mrp || "",
      colors: (p.colors || []).join(", "),
      tags: (p.tags || []).join(", "),
      isAvailable: p.isAvailable,
      isFeatured: p.isFeatured,
      isVisible: p.isVisible,
    });
    setFiles([]);
    setKeptExisting(p.images || []);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (keptExisting.length + files.length === 0) return toast.error("Add at least one photo.");
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (!form.category) fd.set("category", "");
      fd.append("keepImageIds", JSON.stringify(keptExisting.map((i) => i.publicId)));
      files.forEach((f) => fd.append("images", f));
      const cfg = { headers: { "Content-Type": "multipart/form-data" } };
      if (editing) await api.put(`/products/${editing._id}`, fd, cfg);
      else await api.post("/products", fd, cfg);
      toast.success(editing ? "Product updated." : "Product added.");
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id) => { try { await api.patch(`/products/${id}/toggle`); load(); } catch { toast.error("Failed to update."); } };
  const remove = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try { await api.delete(`/products/${id}`); toast.success("Product deleted."); load(); } catch { toast.error("Failed to delete."); }
  };

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (catFilter === "all" || p.category?._id === catFilter) &&
          (!q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase()))
      ),
    [products, q, catFilter]
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-plum font-semibold">Products</h1>
          <p className="text-plum-dark/60 text-sm mt-1">These appear in your Shop page. {products.length} total.</p>
        </div>
        <button onClick={openAdd} className="btn-primary shrink-0">
          <Plus size={18} /> <span className="hidden sm:inline">Add Product</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-plum-dark/30" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className={`${input} pl-10`} />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className={`${input} sm:w-52`}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="craft-card p-12 text-center text-plum-dark/50">
          <ShoppingBag className="mx-auto mb-3 text-plum/20" size={36} />
          {products.length === 0 ? "No products yet. Add your first one!" : "No products match your search."}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p._id} className={`craft-card p-3 flex items-center gap-3 ${!p.isVisible ? "opacity-60" : ""}`}>
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-beige shrink-0">
                {p.images?.[0] ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-plum/20"><ShoppingBag size={22} /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-plum truncate flex items-center gap-1.5">
                  {p.name} {p.isFeatured && <Star size={13} className="text-gold fill-gold shrink-0" />}
                </p>
                <p className="text-xs text-plum-dark/50 truncate">
                  {formatPrice(p.price)} {p.category?.name ? `· ${p.category.name}` : ""} {!p.isAvailable && "· Out of stock"}
                </p>
              </div>
              <div className="flex shrink-0">
                <button onClick={() => toggle(p._id)} className="p-2 text-plum-dark/50 hover:text-plum">{p.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                <button onClick={() => openEdit(p)} className="p-2 text-plum-dark/50 hover:text-plum"><Pencil size={16} /></button>
                <button onClick={() => remove(p._id)} className="p-2 text-plum-dark/50 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit Product" : "Add Product"} onClose={() => setModalOpen(false)} wide>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={label}>Name</label>
              <input required value={form.name} onChange={(e) => set({ name: e.target.value })} className={input} placeholder="Floral Hoop Art" />
            </div>
            <div>
              <label className={label}>Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => set({ description: e.target.value })} className={`${input} resize-none`} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Price (₹)</label>
                <input required type="number" min="0" step="1" value={form.price} onChange={(e) => set({ price: e.target.value })} className={input} />
              </div>
              <div>
                <label className={label}>MRP (₹) <span className="text-plum-dark/40 font-normal">— optional, shows a discount</span></label>
                <input type="number" min="0" step="1" value={form.mrp} onChange={(e) => set({ mrp: e.target.value })} className={input} />
              </div>
            </div>

            <div>
              <label className={label}>Category</label>
              <select value={form.category} onChange={(e) => set({ category: e.target.value })} className={input}>
                <option value="">Uncategorised</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Colours <span className="text-plum-dark/40 font-normal">(comma separated)</span></label>
                <input value={form.colors} onChange={(e) => set({ colors: e.target.value })} className={input} placeholder="Pink, Ivory" />
              </div>
              <div>
                <label className={label}>Tags <span className="text-plum-dark/40 font-normal">(comma separated)</span></label>
                <input value={form.tags} onChange={(e) => set({ tags: e.target.value })} className={input} placeholder="floral, gift" />
              </div>
            </div>

            <ImagePicker
              label="Photos"
              max={MAX_IMAGES}
              existing={keptExisting}
              onRemoveExisting={(img) => setKeptExisting((prev) => prev.filter((i) => i.publicId !== img.publicId))}
              files={files}
              onFilesChange={setFiles}
              hint="First photo is the main one shown in the shop. The second shows on hover."
            />

            <div className="flex flex-wrap gap-5">
              <label className="flex items-center gap-2 text-sm text-plum-dark">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => set({ isAvailable: e.target.checked })} /> In stock
              </label>
              <label className="flex items-center gap-2 text-sm text-plum-dark">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => set({ isFeatured: e.target.checked })} /> Featured on home page
              </label>
              <label className="flex items-center gap-2 text-sm text-plum-dark">
                <input type="checkbox" checked={form.isVisible} onChange={(e) => set({ isVisible: e.target.checked })} /> Visible on live site
              </label>
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? <Loader2 className="animate-spin" size={18} /> : editing ? "Save Changes" : "Add Product"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProductsManager;
