import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Image as ImageIcon, Star } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";

const emptyForm = { title: "", description: "", tags: "", isFeatured: false, isVisible: true };

const GalleryManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/gallery/all");
      setItems(data);
    } catch {
      toast.error("Failed to load gallery.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || "",
      tags: (item.tags || []).join(", "),
      isFeatured: item.isFeatured,
      isVisible: item.isVisible,
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !imageFile) {
      toast.error("Please select an image.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("tags", JSON.stringify(form.tags.split(",").map((t) => t.trim()).filter(Boolean)));
      fd.append("isFeatured", form.isFeatured);
      fd.append("isVisible", form.isVisible);
      if (imageFile) fd.append("image", imageFile);

      if (editing) {
        await api.put(`/gallery/${editing._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Gallery item updated!");
      } else {
        await api.post("/gallery", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Gallery item added!");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save gallery item.");
    } finally {
      setSaving(false);
    }
  };

  const toggleField = async (item, field) => {
    try {
      const fd = new FormData();
      fd.append(field, !item[field]);
      await api.put(`/gallery/${item._id}`, fd);
      load();
    } catch {
      toast.error("Failed to update item.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this gallery item?")) return;
    try {
      await api.delete(`/gallery/${id}`);
      toast.success("Item deleted.");
      load();
    } catch {
      toast.error("Failed to delete item.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-plum font-semibold">Gallery Manager</h1>
          <p className="text-plum-dark/60 text-sm mt-1">Upload and organize portfolio pieces shown in the Canvas Gallery.</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={18} /> Add Item
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="craft-card p-12 text-center text-plum-dark/50">
          <ImageIcon className="mx-auto mb-3 text-plum/20" size={36} />
          No gallery items yet. Add your first piece!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <div key={item._id} className={`craft-card overflow-hidden ${!item.isVisible ? "opacity-50" : ""}`}>
              <div className="relative h-40">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                {item.isFeatured && (
                  <span className="absolute top-2 left-2 bg-gold text-plum-dark text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={10} className="fill-plum-dark" /> Featured
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display font-semibold text-plum text-sm mb-1 truncate">{item.title}</h3>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags?.map((t) => (
                    <span key={t} className="text-[10px] bg-blush/30 text-plum px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button onClick={() => toggleField(item, "isVisible")} className="p-1.5 text-plum-dark/50 hover:text-plum" title="Toggle visibility">
                      {item.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button onClick={() => toggleField(item, "isFeatured")} className="p-1.5 text-plum-dark/50 hover:text-gold" title="Toggle featured">
                      <Star size={15} className={item.isFeatured ? "fill-gold text-gold" : ""} />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)} className="p-1.5 text-plum-dark/50 hover:text-plum" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 text-plum-dark/50 hover:text-red-500" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit Gallery Item" : "Add Gallery Item"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-plum-dark block mb-1.5">Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-plum-dark block mb-1.5">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-plum-dark block mb-1.5">Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="Crochet, Hoop Art, Custom Clothing" className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-plum-dark block mb-1.5">
                Image {editing && "(leave blank to keep current)"}
              </label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-plum-dark">
                <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} />
                Visible
              </label>
              <label className="flex items-center gap-2 text-sm text-plum-dark">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                Featured
              </label>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? <Loader2 className="animate-spin" size={18} /> : (editing ? "Save Changes" : "Add Item")}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default GalleryManager;
