import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, ArrowUp, ArrowDown, LayoutGrid, Search } from "lucide-react";
import * as Icons from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import ImagePicker from "../../components/admin/ImagePicker";

const input = "w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40";
const label = "text-sm font-medium text-plum-dark block mb-1.5";
const COLORS = ["#F6D9DC", "#F8E4D2", "#E3EBDD", "#EADCF0", "#DCE8F0", "#FBEFC7", "#F2D9E0"];
const ICONS = ["Sparkles", "Frame", "Heart", "Gift", "Flower2", "Shirt", "Gem", "Scissors", "ShoppingBag", "Star", "Home", "Baby"];

const emptyForm = { name: "", tagline: "", icon: "Sparkles", color: COLORS[0], isVisible: true };

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [iconQuery, setIconQuery] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/categories/all");
      setCategories(data);
    } catch {
      toast.error("Failed to load categories.");
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
    setRemoveImage(false);
    setIconQuery("");
    setModalOpen(true);
  };
  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, tagline: cat.tagline || "", icon: cat.icon || "Sparkles", color: cat.color || COLORS[0], isVisible: cat.isVisible });
    setFiles([]);
    setRemoveImage(false);
    setIconQuery("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (files[0]) fd.append("image", files[0]);
      else if (removeImage) fd.append("removeImage", "true");
      const cfg = { headers: { "Content-Type": "multipart/form-data" } };
      if (editing) await api.put(`/categories/${editing._id}`, fd, cfg);
      else await api.post("/categories", fd, cfg);
      toast.success(editing ? "Category updated." : "Category added.");
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    try {
      await api.patch("/categories/reorder", { ids: next.map((c) => c._id) });
    } catch {
      toast.error("Couldn't save the new order.");
      load();
    }
  };
  const toggle = async (id) => { try { await api.patch(`/categories/${id}/toggle`); load(); } catch { toast.error("Failed to update."); } };
  const remove = async (id) => {
    if (!confirm("Delete this category? Products in it will become uncategorised, not deleted.")) return;
    try { await api.delete(`/categories/${id}`); toast.success("Category deleted."); load(); } catch { toast.error("Failed to delete."); }
  };

  const iconChoices = ICONS.filter((n) => n.toLowerCase().includes(iconQuery.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-plum font-semibold">Categories</h1>
          <p className="text-plum-dark/60 text-sm mt-1">Shown as circles on the home page and cards on the Categories page.</p>
        </div>
        <button onClick={openAdd} className="btn-primary shrink-0">
          <Plus size={18} /> <span className="hidden sm:inline">Add Category</span>
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : categories.length === 0 ? (
        <div className="craft-card p-12 text-center text-plum-dark/50">
          <LayoutGrid className="mx-auto mb-3 text-plum/20" size={36} />
          No categories yet. Add your first one!
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((c, i) => {
            const Icon = Icons[c.icon] || Icons.Sparkles;
            return (
              <div key={c._id} className={`craft-card p-4 flex items-center gap-4 ${!c.isVisible ? "opacity-60" : ""}`}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ background: c.color }}>
                  {c.image ? <img src={c.image} alt="" className="w-full h-full object-cover" /> : <Icon size={24} className="text-plum" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-plum truncate">{c.name}</p>
                  <p className="text-xs text-plum-dark/50 truncate">{c.tagline || "No tagline"} · {c.isVisible ? "Visible" : "Hidden"}</p>
                </div>
                <div className="flex shrink-0">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="p-2 text-plum-dark/50 hover:text-plum disabled:opacity-25"><ArrowUp size={16} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === categories.length - 1} className="p-2 text-plum-dark/50 hover:text-plum disabled:opacity-25"><ArrowDown size={16} /></button>
                  <button onClick={() => toggle(c._id)} className="p-2 text-plum-dark/50 hover:text-plum">{c.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                  <button onClick={() => openEdit(c)} className="p-2 text-plum-dark/50 hover:text-plum"><Pencil size={16} /></button>
                  <button onClick={() => remove(c._id)} className="p-2 text-plum-dark/50 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit Category" : "Add Category"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={label}>Name</label>
              <input required value={form.name} onChange={(e) => set({ name: e.target.value })} className={input} placeholder="Embroidery" />
            </div>
            <div>
              <label className={label}>Tagline <span className="text-plum-dark/40 font-normal">(optional)</span></label>
              <input value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} className={input} placeholder="Hand-stitched hoops & wall art" />
            </div>

            <ImagePicker
              label="Photo (optional — falls back to an icon)"
              max={1}
              existing={editing && !removeImage && editing.image ? [{ url: editing.image, publicId: editing.imagePublicId }] : []}
              onRemoveExisting={() => setRemoveImage(true)}
              files={files}
              onFilesChange={setFiles}
            />

            <div>
              <label className={label}>Icon <span className="text-plum-dark/40 font-normal">(used when there's no photo)</span></label>
              <div className="relative mb-2">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-plum-dark/30" />
                <input value={iconQuery} onChange={(e) => setIconQuery(e.target.value)} placeholder="Search icons…" className={`${input} pl-9`} />
              </div>
              <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                {iconChoices.map((name) => {
                  const IconOpt = Icons[name];
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => set({ icon: name })}
                      title={name}
                      className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-colors ${form.icon === name ? "border-terracotta bg-terracotta/10 text-terracotta" : "border-plum/10 text-plum-dark/60 hover:border-plum/30"}`}
                    >
                      <IconOpt size={20} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={label}>Background colour</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => set({ color: c })} className={`w-9 h-9 rounded-full border-2 transition-transform ${form.color === c ? "border-plum scale-110" : "border-white"}`} style={{ background: c }} />
                ))}
                <input type="color" value={form.color} onChange={(e) => set({ color: e.target.value })} className="w-9 h-9 rounded-full cursor-pointer" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-plum-dark">
              <input type="checkbox" checked={form.isVisible} onChange={(e) => set({ isVisible: e.target.checked })} />
              Visible on live site
            </label>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? <Loader2 className="animate-spin" size={18} /> : editing ? "Save Changes" : "Add Category"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CategoriesManager;
