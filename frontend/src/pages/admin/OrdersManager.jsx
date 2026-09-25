import { useEffect, useState } from "react";
import { ClipboardList, Download, X, Loader2, Calendar, Phone, Mail } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import WhatsAppIcon from "../../components/WhatsAppIcon";
import { useSiteConfig } from "../../context/SiteConfigContext";
import { buildWhatsAppLinkWithText } from "../../utils/whatsapp";

// Customer phone -> wa.me number (assume India if a bare 10-digit number)
const toWaNumber = (phone = "") => {
  const d = phone.replace(/\D/g, "");
  return d.length === 10 ? `91${d}` : d;
};

const STATUSES = ["All", "Pending", "In Progress", "Completed", "Cancelled"];
const statusColor = {
  Pending: "bg-gold/20 text-plum-dark",
  "In Progress": "bg-terracotta/20 text-terracotta",
  Completed: "bg-olive/20 text-olive",
  Cancelled: "bg-red-100 text-red-500",
};

const OrdersManager = () => {
  const { brandName } = useSiteConfig();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = async (status = statusFilter) => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders", { params: status !== "All" ? { status } : {} });
      setOrders(data);
    } catch {
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(statusFilter); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      const { data } = await api.patch(`/orders/${id}/status`, { status });
      toast.success(`Order marked as ${status}.`);
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
      if (selected?._id === id) setSelected(data);
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const saveRemarks = async (id, remarks) => {
    try {
      const { data } = await api.patch(`/orders/${id}/status`, { adminRemarks: remarks });
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
      toast.success("Remarks saved.");
    } catch {
      toast.error("Failed to save remarks.");
    }
  };

  const downloadRequirements = (order) => {
    const text = `CUSTOM ORDER REQUEST — ${brandName}
================================================
Name: ${order.name}
Email: ${order.email || "Not provided"}
Phone: ${order.phone}
Service Type: ${order.serviceType}
Target Delivery: ${order.targetDeliveryDate ? new Date(order.targetDeliveryDate).toLocaleDateString() : "Not specified"}
Status: ${order.status}
Submitted: ${new Date(order.createdAt).toLocaleString()}

Notes:
${order.notes || "None"}

Reference Images: ${order.referenceImages?.length || 0} attached (view in admin panel)
`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-${order._id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-plum font-semibold">Orders Management</h1>
        <p className="text-plum-dark/60 text-sm mt-1">Review, filter, and update the status of custom order requests.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s ? "bg-plum text-cream" : "bg-white text-plum-dark border border-plum/10 hover:bg-blush/30"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="craft-card p-12 text-center text-plum-dark/50">
          <ClipboardList className="mx-auto mb-3 text-plum/20" size={36} />
          No orders found for this filter.
        </div>
      ) : (
        <div className="craft-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blush/20">
                <tr className="text-left text-plum-dark/60">
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Service</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Submitted</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-t border-plum/5 hover:bg-beige/50">
                    <td className="p-4">
                      <p className="font-medium text-plum-dark">{o.name}</p>
                      <p className="text-xs text-plum-dark/50">{o.email || o.phone}</p>
                    </td>
                    <td className="p-4 text-plum-dark/70">{o.serviceType}</td>
                    <td className="p-4">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        disabled={updating}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 ${statusColor[o.status]}`}
                      >
                        {STATUSES.filter((s) => s !== "All").map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-plum-dark/50">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(o)} className="text-terracotta text-xs font-medium hover:underline">
                          View
                        </button>
                        <button onClick={() => downloadRequirements(o)} className="text-plum-dark/50 hover:text-plum" title="Download requirements">
                          <Download size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <Modal title="Order Details" onClose={() => setSelected(null)} wide>
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-plum-dark">
                <Mail size={16} className="text-terracotta" /> {selected.email || "No email provided"}
              </div>
              <div className="flex items-center gap-2 text-plum-dark">
                <Phone size={16} className="text-terracotta" /> {selected.phone}
              </div>
              <div className="flex items-center gap-2 text-plum-dark">
                <Calendar size={16} className="text-terracotta" />
                {selected.targetDeliveryDate ? new Date(selected.targetDeliveryDate).toLocaleDateString() : "No target date"}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[selected.status]}`}>
                  {selected.status}
                </span>
              </div>
            </div>

            <a
              href={buildWhatsAppLinkWithText(
                `Hi ${selected.name}! This is ${brandName} regarding your custom order request for ${selected.serviceType}.`,
                toWaNumber(selected.phone)
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <WhatsAppIcon size={16} /> Reply on WhatsApp
            </a>

            <div>
              <p className="text-sm font-medium text-plum-dark mb-1">Service Type</p>
              <p className="text-plum-dark/70 text-sm">{selected.serviceType}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-plum-dark mb-1">Customer Notes</p>
              <p className="text-plum-dark/70 text-sm whitespace-pre-wrap">{selected.notes || "No notes provided."}</p>
            </div>

            {selected.referenceImages?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-plum-dark mb-2">Reference Images</p>
                <div className="flex flex-wrap gap-3">
                  {selected.referenceImages.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer">
                      <img src={img} alt="" className="w-24 h-24 object-cover rounded-lg border border-plum/10" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-plum-dark mb-1">Admin Remarks</p>
              <textarea
                defaultValue={selected.adminRemarks}
                rows={3}
                onBlur={(e) => saveRemarks(selected._id, e.target.value)}
                placeholder="Internal notes (e.g. materials needed, pricing agreed)..."
                className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white resize-none text-sm"
              />
            </div>

            <button onClick={() => downloadRequirements(selected)} className="btn-secondary w-full">
              <Download size={18} /> Download Requirements
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrdersManager;
