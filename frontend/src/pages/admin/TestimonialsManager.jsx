import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, MessageSquareQuote, Star } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";

const emptyForm = { customerName: "", message: "", rating: 5, isVisible: true };

const TestimonialsManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/testimonials/all");
      setItems(data);
    } catch {
      toast.error("Failed to load testimonials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ customerName: item.customerName, message: item.message, rating: item.rating, isVisible: item.isVisible });
    setPhotoFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append("customerPhoto", photoFile);

      if (editing) {
        await api.put(`/testimonials/${editing._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Testimonial updated!");
      } else {
        await api.post("/testimonials", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Testimonial added!");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save testimonial.");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (item) => {
    try {
      const fd = new FormData();
      fd.append("isVisible", !item.isVisible);
      await api.put(`/testimonials/${item._id}`, fd);
      load();
    } catch {
      toast.error("Failed to toggle visibility.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await api.delete(`/testimonials/${id}`);
      toast.success("Testimonial deleted.");
      load();
    } catch {
      toast.error("Failed to delete testimonial.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-plum font-semibold">Testimonials Manager</h1>
          <p className="text-plum-dark/60 text-sm mt-1">Curate the reviews shown on your homepage.</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={18} /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="craft-card p-12 text-center text-plum-dark/50">
          <MessageSquareQuote className="mx-auto mb-3 text-plum/20" size={36} />
          No testimonials yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((t) => (
            <div key={t._id} className={`craft-card p-5 ${!t.isVisible ? "opacity-50" : ""}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className={i < t.rating ? "fill-gold text-gold" : "text-plum/10"} />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleVisibility(t)} className="p-1.5 text-plum-dark/50 hover:text-plum">
                    {t.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button onClick={() => openEdit(t)} className="p-1.5 text-plum-dark/50 hover:text-plum">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(t._id)} className="p-1.5 text-plum-dark/50 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-plum-dark/70 italic mb-3 line-clamp-3">"{t.message}"</p>
              <p className="text-sm font-medium text-plum">{t.customerName}</p>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit Testimonial" : "Add Testimonial"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-plum-dark block mb-1.5">Customer Name</label>
              <input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-plum-dark block mb-1.5">Message</label>
              <textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-plum-dark block mb-1.5">Rating</label>
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white">
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-plum-dark block mb-1.5">Customer Photo (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} className="text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm text-plum-dark">
              <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} />
              Visible on live site
            </label>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? <Loader2 className="animate-spin" size={18} /> : (editing ? "Save Changes" : "Add Testimonial")}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TestimonialsManager;
