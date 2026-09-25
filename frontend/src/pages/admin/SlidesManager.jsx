import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, ArrowUp, ArrowDown, Images } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import ImagePicker from "../../components/admin/ImagePicker";
import SlidePreview from "../../components/admin/SlidePreview";

const input = "w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40";
const label = "text-sm font-medium text-plum-dark block mb-1.5";

const GRADIENTS = [
  { name: "Plum → Terracotta", from: "#6A1B38", to: "#C86D51", theme: "light" },
  { name: "Terracotta → Peach", from: "#C86D51", to: "#F2C9A0", theme: "dark" },
  { name: "Olive → Sage", from: "#5F6F52", to: "#A9B79A", theme: "light" },
  { name: "Blush → Cream", from: "#E8B4B8", to: "#FDF1E4", theme: "dark" },
  { name: "Gold → Cream", from: "#D4AF37", to: "#FBEFC7", theme: "dark" },
  { name: "Deep Plum", from: "#4E1327", to: "#6A1B38", theme: "light" },
];

const LINK_PRESETS = [
  { value: "/shop", label: "All products" },
  { value: "/shop?offers=true", label: "Offers" },
  { value: "/categories", label: "Categories page" },
  { value: "/custom-order", label: "Custom order" },
  { value: "/gallery", label: "Gallery" },
  { value: "/contact", label: "Contact" },
];

const emptyForm = {
  title: "",
  subtitle: "",
  badge: "",
  ctaText: "Shop Now",
  ctaLink: "/shop",
  bgFrom: "#6A1B38",
  bgTo: "#C86D51",
  textTheme: "light",
  isVisible: true,
};

const SlidesManager = () => {
  const [slides, setSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [s, c] = await Promise.all([api.get("/slides/all"), api.get("/categories/all")]);
      setSlides(s.data);
      setCategories(c.data);
    } catch {
      toast.error("Failed to load slides.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const linkOptions = useMemo(
    () => [...LINK_PRESETS, ...categories.map((c) => ({ value: `/shop?category=${c.slug}`, label: `Category: ${c.name}` }))],
    [categories]
  );
  const isPreset = linkOptions.some((o) => o.value === form.ctaLink);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFiles([]);
    setRemoveImage(false);
    setModalOpen(true);
  };

  const openEdit = (slide) => {
    setEditing(slide);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle || "",
      badge: slide.badge || "",
      ctaText: slide.ctaText || "Shop Now",
      ctaLink: slide.ctaLink || "/shop",
      bgFrom: slide.bgFrom || "#6A1B38",
      bgTo: slide.bgTo || "#C86D51",
      textTheme: slide.textTheme || "light",
      isVisible: slide.isVisible,
    });
    setFiles([]);
    setRemoveImage(false);
    setModalOpen(true);
  };

  // Live preview: the form + the newly chosen (or existing) picture
  const previewSlide = useMemo(() => {
    let image = "";
    if (files[0]) image = URL.createObjectURL(files[0]);
    else if (editing && !removeImage) image = editing.image;
    return { ...form, image };
  }, [form, files, editing, removeImage]);
  useEffect(() => () => previewSlide.image?.startsWith("blob:") && URL.revokeObjectURL(previewSlide.image), [previewSlide]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (files[0]) fd.append("image", files[0]);
      else if (removeImage) fd.append("removeImage", "true");

      const cfg = { headers: { "Content-Type": "multipart/form-data" } };
      if (editing) await api.put(`/slides/${editing._id}`, fd, cfg);
      else await api.post("/slides", fd, cfg);
      toast.success(editing ? "Slide updated — live now!" : "Slide added — live now!");
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save slide.");
    } finally {
      setSaving(false);
    }
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next);
    try {
      await api.patch("/slides/reorder", { ids: next.map((s) => s._id) });
    } catch {
      toast.error("Couldn't save the new order.");
      load();
    }
  };

  const toggle = async (id) => {
    try {
      await api.patch(`/slides/${id}/toggle`);
      load();
    } catch {
      toast.error("Failed to change visibility.");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this slide? This cannot be undone.")) return;
    try {
      await api.delete(`/slides/${id}`);
      toast.success("Slide deleted.");
      load();
    } catch {
      toast.error("Failed to delete slide.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-plum font-semibold">Home Slider</h1>
          <p className="text-plum-dark/60 text-sm mt-1">The banners that slide across the top of your home page. Reorder with the arrows.</p>
        </div>
        <button onClick={openAdd} className="btn-primary shrink-0">
          <Plus size={18} /> <span className="hidden sm:inline">Add Slide</span>
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : slides.length === 0 ? (
        <div className="craft-card p-12 text-center text-plum-dark/50">
          <Images className="mx-auto mb-3 text-plum/20" size={36} />
          No slides yet — visitors currently see a default banner built from Site Settings. Add your first slide!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {slides.map((s, i) => (
            <div key={s._id} className={`craft-card p-3 ${!s.isVisible ? "opacity-60" : ""}`}>
              <SlidePreview slide={s} />
              <div className="flex items-center justify-between mt-3 px-1">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-plum truncate">{i + 1}. {s.title}</p>
                  <p className="text-xs text-plum-dark/50 truncate">{s.isVisible ? "Visible" : "Hidden"} · {s.ctaLink}</p>
                </div>
                <div className="flex shrink-0">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="p-2 text-plum-dark/50 hover:text-plum disabled:opacity-25" title="Move earlier"><ArrowUp size={16} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === slides.length - 1} className="p-2 text-plum-dark/50 hover:text-plum disabled:opacity-25" title="Move later"><ArrowDown size={16} /></button>
                  <button onClick={() => toggle(s._id)} className="p-2 text-plum-dark/50 hover:text-plum" title="Show / hide">{s.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                  <button onClick={() => openEdit(s)} className="p-2 text-plum-dark/50 hover:text-plum" title="Edit"><Pencil size={16} /></button>
                  <button onClick={() => remove(s._id)} className="p-2 text-plum-dark/50 hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit Slide" : "Add Slide"} onClose={() => setModalOpen(false)} wide>
          <div className="mb-5">
            <p className="text-xs text-plum-dark/50 mb-2">Live preview (phone view)</p>
            <div className="max-w-[360px] mx-auto"><SlidePreview slide={previewSlide} /></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={label}>Title</label>
              <input required value={form.title} onChange={(e) => set({ title: e.target.value })} className={input} placeholder="Festive Gifting, Made By Hand" />
            </div>
            <div>
              <label className={label}>Subtitle</label>
              <textarea rows={2} value={form.subtitle} onChange={(e) => set({ subtitle: e.target.value })} className={`${input} resize-none`} placeholder="One short line under the title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Small badge <span className="text-plum-dark/40 font-normal">(optional)</span></label>
                <input value={form.badge} onChange={(e) => set({ badge: e.target.value })} className={input} placeholder="Festive Sale" />
              </div>
              <div>
                <label className={label}>Button text</label>
                <input value={form.ctaText} onChange={(e) => set({ ctaText: e.target.value })} className={input} />
              </div>
            </div>

            <div>
              <label className={label}>Button opens</label>
              <select
                value={isPreset ? form.ctaLink : "custom"}
                onChange={(e) => set({ ctaLink: e.target.value === "custom" ? "https://" : e.target.value })}
                className={input}
              >
                {linkOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                <option value="custom">Custom link…</option>
              </select>
              {!isPreset && (
                <input value={form.ctaLink} onChange={(e) => set({ ctaLink: e.target.value })} className={`${input} mt-2`} placeholder="https://example.com or /page" />
              )}
            </div>

            <div>
              <label className={label}>Background colours</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {GRADIENTS.map((g) => (
                  <button
                    key={g.name}
                    type="button"
                    title={g.name}
                    onClick={() => set({ bgFrom: g.from, bgTo: g.to, textTheme: g.theme })}
                    className="w-14 h-9 rounded-lg border-2 border-white shadow-card hover:scale-110 transition-transform"
                    style={{ background: `linear-gradient(120deg, ${g.from}, ${g.to})` }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-2 text-sm">From <input type="color" value={form.bgFrom} onChange={(e) => set({ bgFrom: e.target.value })} className="w-10 h-9 rounded cursor-pointer" /></label>
                <label className="flex items-center gap-2 text-sm">To <input type="color" value={form.bgTo} onChange={(e) => set({ bgTo: e.target.value })} className="w-10 h-9 rounded cursor-pointer" /></label>
                <select value={form.textTheme} onChange={(e) => set({ textTheme: e.target.value })} className="px-3 py-2 rounded-xl border border-plum/15 bg-white text-sm">
                  <option value="light">Light text (on dark colours)</option>
                  <option value="dark">Dark text (on light colours)</option>
                </select>
              </div>
            </div>

            <ImagePicker
              label="Banner picture (optional)"
              max={1}
              existing={editing && !removeImage && editing.image ? [{ url: editing.image, publicId: editing.imagePublicId }] : []}
              onRemoveExisting={() => setRemoveImage(true)}
              files={files}
              onFilesChange={setFiles}
              hint="Shown on the right side. A tall or square photo with the subject on the right works best."
            />

            <label className="flex items-center gap-2 text-sm text-plum-dark">
              <input type="checkbox" checked={form.isVisible} onChange={(e) => set({ isVisible: e.target.checked })} />
              Visible on live site
            </label>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? <Loader2 className="animate-spin" size={18} /> : editing ? "Save Changes" : "Add Slide"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SlidesManager;
