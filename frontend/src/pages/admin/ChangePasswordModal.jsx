import { useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40";

const ChangePasswordModal = ({ onClose }) => {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (next.length < 8) return toast.error("New password must be at least 8 characters.");
    if (next !== confirm) return toast.error("New passwords do not match.");
    setSaving(true);
    const ok = await changePassword(current, next);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal title="Change Password" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" autoComplete="current-password" required value={current}
          onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" className={inputCls} />
        <input type="password" autoComplete="new-password" required value={next}
          onChange={(e) => setNext(e.target.value)} placeholder="New password (min 8 characters)" className={inputCls} />
        <input type="password" autoComplete="new-password" required value={confirm}
          onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" className={inputCls} />
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? <Loader2 className="animate-spin" size={18} /> : "Update Password"}
        </button>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
