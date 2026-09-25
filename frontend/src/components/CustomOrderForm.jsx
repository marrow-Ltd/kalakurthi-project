import { useState } from "react";
import { UploadCloud, X, Send, Loader2 } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import WhatsAppIcon from "./WhatsAppIcon";
import useWhatsApp from "../hooks/useWhatsApp";

const SERVICE_TYPES = ["Photo Embroidery", "Cloth Embroidery", "Crochet Items", "Canvas Creations", "Other"];

const CustomOrderForm = () => {
  const wa = useWhatsApp();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: SERVICE_TYPES[0],
    notes: "",
    targetDeliveryDate: "",
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0, 4 - files.length);
    setFiles([...files, ...selected]);
  };

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => fd.append(key, val));
      files.forEach((f) => fd.append("referenceImages", f));

      await api.post("/orders", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Your custom order request has been sent!");
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="craft-card p-10 text-center max-w-xl mx-auto animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-olive/10 flex items-center justify-center mx-auto mb-5">
          <Send className="text-olive" size={28} />
        </div>
        <h3 className="font-display text-2xl text-plum font-semibold mb-2">Request Received!</h3>
        <p className="text-plum-dark/70">
          Thank you for trusting us with your custom order. Our team will reach out within 1–2 business days
          to confirm the details and pricing.
        </p>
        <a
          href={wa.linkWithText(
            `Hi ${wa.brandName}! I just submitted a custom order request for ${form.serviceType} (name: ${form.name}). Could we discuss the details?`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp mt-6"
        >
          <WhatsAppIcon size={18} /> Continue on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="craft-card p-6 sm:p-10 max-w-2xl mx-auto space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-medium text-plum-dark block mb-1.5">Full Name</label>
          <input
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-plum-dark block mb-1.5">Email <span className="text-plum-dark/40 font-normal">(optional)</span></label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-medium text-plum-dark block mb-1.5">Phone Number</label>
          <input
            required
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            placeholder="+91 9xxxxxxxxx"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-plum-dark block mb-1.5">Service Type</label>
          <select
            name="serviceType"
            value={form.serviceType}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          >
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-plum-dark block mb-1.5">Target Delivery Date</label>
        <input
          type="date"
          name="targetDeliveryDate"
          value={form.targetDeliveryDate}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-plum-dark block mb-1.5">Custom Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
          placeholder="Tell us about colours, size, occasion, or any special requests..."
        />
      </div>

      <div>
        <label className="text-sm font-medium text-plum-dark block mb-1.5">Reference Images (up to 4)</label>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-plum/20 rounded-xl py-8 cursor-pointer hover:border-terracotta/50 transition-colors bg-white/50">
          <UploadCloud className="text-plum/40 mb-2" size={28} />
          <span className="text-sm text-plum-dark/60">Click to upload photos</span>
          <input type="file" accept="image/*" multiple hidden onChange={handleFiles} disabled={files.length >= 4} />
        </label>
        {files.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {files.map((f, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-plum/10">
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-0.5 right-0.5 bg-plum/80 text-cream rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? (
          <>
            <Loader2 className="animate-spin" size={18} /> Sending...
          </>
        ) : (
          <>
            Submit Custom Order <Send size={18} />
          </>
        )}
      </button>
    </form>
  );
};

export default CustomOrderForm;
