import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Scissors } from "lucide-react";
import * as Icons from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";

const ICON_OPTIONS = ["Sparkles", "Image", "Shirt", "Heart", "Frame", "Scissors", "Palette", "Gift", "Star", "Feather"];

const emptyForm = {
  title: "",
  description: "",
  icon: "Sparkles",
  priceLabel: "",
  features: "",
  isVisible: true,
};

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/services/all");
      setServices(data);
    } catch {
      toast.error("Failed to load services.");
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

  const openEdit = (service) => {
    setEditing(service);
    setForm({
      title: service.title,
      description: service.description,
      icon: service.icon,
      priceLabel: service.priceLabel,
      features: (service.features || []).join(", "),
      isVisible: service.isVisible,
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("icon", form.icon);
      fd.append("priceLabel", form.priceLabel);
      fd.append("features", JSON.stringify(form.features.split(",").map((f) => f.trim()).filter(Boolean)));
      fd.append("isVisible", form.isVisible);
      if (imageFile) fd.append("image", imageFile);

      if (editing) {
        await api.put(`/services/${editing._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Service updated!");
      } else {
        await api.post("/services", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Service added!");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save service.");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (id) => {
    try {
      await api.patch(`/services/${id}/toggle`);
      load();
    } catch {
      toast.error("Failed to toggle visibility.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success("Service deleted.");
      load();
    } catch {
      toast.error("Failed to delete service.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-plum font-semibold">Service Manager</h1>
          <p className="text-plum-dark/60 text-sm mt-1">Changes here update the live Services section instantly.</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={18} /> Add Service
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="craft-card p-12 text-center text-plum-dark/50">
          <Scissors className="mx-auto mb-3 text-plum/20" size={36} />
          No services yet. Add your first one!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => {
            const Icon = Icons[s.icon] || Icons.Sparkles;
            return (
              <div key={s._id} className={`craft-card p-5 ${!s.isVisible ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-full bg-blush/40 flex items-center justify-center text-plum">
                    <Icon size={20} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleVisibility(s._id)} className="p-2 text-plum-dark/50 hover:text-plum" title="Toggle visibility">
                      {s.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => openEdit(s)} className="p-2 text-plum-dark/50 hover:text-plum" title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(s._id)} className="p-2 text-plum-dark/50 hover:text-red-500" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-display font-semibold text-plum mb-1">{s.title}</h3>
                <p className="text-sm text-plum-dark/60 line-clamp-2 mb-2">{s.description}</p>
                <span className="text-xs font-semibold text-terracotta">{s.priceLabel}</span>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit Service" : "Add Service"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-plum-dark block mb-1.5">Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-plum-dark block mb-1.5">Description</label>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-plum-dark block mb-1.5">Icon</label>
                <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white">
                  {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-plum-dark block mb-1.5">Price Label</label>
                <input value={form.priceLabel} onChange={(e) => setForm({ ...form, priceLabel: e.target.value })}
                  placeholder="Starting from ₹999" className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-plum-dark block mb-1.5">Features (comma-separated)</label>
              <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder="Custom sizing, 2-week turnaround" className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-plum-dark block mb-1.5">Image</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm text-plum-dark">
              <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} />
              Visible on live site
            </label>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? <Loader2 className="animate-spin" size={18} /> : (editing ? "Save Changes" : "Add Service")}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ServiceManager;
