import { useEffect, useState } from "react";
import { Save, Loader2, Settings } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const SiteConfigManager = () => {
  const [form, setForm] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/site-config").then(({ data }) => setForm(data)).catch(() => toast.error("Failed to load site settings."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (!["_id", "__v", "createdAt", "updatedAt", "key"].includes(key)) {
          fd.append(key, val);
        }
      });
      if (imageFile) fd.append("heroImage", imageFile);

      const { data } = await api.put("/site-config", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm(data);
      toast.success("Site settings updated! Changes are live now.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <div className="skeleton h-96 rounded-2xl" />;
  }

  const Field = ({ label, name, textarea, type = "text" }) => (
    <div>
      <label className="text-sm font-medium text-plum-dark block mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          value={form[name] || ""}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white resize-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={form[name] || ""}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white"
        />
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <Settings className="text-plum" size={28} />
        <div>
          <h1 className="font-display text-3xl text-plum font-semibold">Site Configuration</h1>
          <p className="text-plum-dark/60 text-sm mt-1">Edit hero banner, tagline, socials, and contact details live.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="craft-card p-6 space-y-4">
          <h2 className="font-display text-lg text-plum font-semibold">Brand</h2>
          <p className="text-xs text-plum-dark/50 -mt-2">The name shown across the site — header, footer, and WhatsApp messages.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Brand Name" name="brandName" />
            <Field label="Tagline" name="brandTagline" />
          </div>
        </section>

        <section className="craft-card p-6 space-y-4">
          <h2 className="font-display text-lg text-plum font-semibold">Hero Banner</h2>
          <p className="text-xs text-plum-dark/50 -mt-2">Used only as a fallback when there are no slides in Home Slider.</p>
          <Field label="Hero Title" name="heroTitle" />
          <Field label="Hero Tagline" name="heroTagline" textarea />
          <Field label="Hero CTA Button Text" name="heroCtaText" />
          <div>
            <label className="text-sm font-medium text-plum-dark block mb-1.5">Hero Background Image</label>
            {form.heroImage && <img src={form.heroImage} alt="" className="w-32 h-32 object-cover rounded-xl mb-2" />}
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="text-sm" />
          </div>
        </section>

        <section className="craft-card p-6 space-y-4">
          <h2 className="font-display text-lg text-plum font-semibold">Announcement Banner</h2>
          <Field label="Announcement Text" name="announcementText" />
          <label className="flex items-center gap-2 text-sm text-plum-dark">
            <input type="checkbox" name="announcementIsActive" checked={form.announcementIsActive} onChange={handleChange} />
            Show announcement banner on site
          </label>
        </section>

        <section className="craft-card p-6 space-y-4">
          <h2 className="font-display text-lg text-plum font-semibold">Social Links</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Instagram Handle" name="instagramHandle" />
            <Field label="Instagram URL" name="instagramUrl" />
            <Field label="Facebook URL" name="facebookUrl" />
            <Field label="WhatsApp Number" name="whatsappNumber" />
          </div>
        </section>

        <section className="craft-card p-6 space-y-4">
          <h2 className="font-display text-lg text-plum font-semibold">Contact Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Contact Email" name="contactEmail" type="email" />
            <Field label="Contact Phone" name="contactPhone" />
          </div>
          <Field label="Studio Address" name="contactAddress" />
        </section>

        <section className="craft-card p-6 space-y-4">
          <h2 className="font-display text-lg text-plum font-semibold">About Text</h2>
          <Field label="Footer About Text" name="aboutText" textarea />
        </section>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </form>
    </div>
  );
};

export default SiteConfigManager;
