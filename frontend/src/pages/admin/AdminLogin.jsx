import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminLogin = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setSubmitting(true);
    const ok = await login(username, password);
    if (!ok) setPassword("");
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-6">
      <form onSubmit={handleSubmit} className="craft-card stitched p-8 sm:p-10 w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-full bg-blush/40 flex items-center justify-center mx-auto mb-4 text-plum">
          <Lock size={24} />
        </div>
        <h1 className="font-display text-2xl text-plum font-semibold mb-1">Admin Access</h1>
        <p className="text-sm text-plum-dark/60 mb-6">Sign in to manage the site.</p>

        <input
          type="text"
          autoFocus
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40 mb-3"
        />
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2.5 rounded-xl border border-plum/15 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40 mb-4"
        />
        <button type="submit" disabled={submitting || !username || !password} className="btn-primary w-full disabled:opacity-60">
          {submitting ? <Loader2 className="animate-spin" size={18} /> : "Enter Admin Panel"}
        </button>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-plum-dark/60 hover:text-terracotta mt-5">
          <ArrowLeft size={14} /> Back to site
        </Link>
      </form>
    </div>
  );
};

export default AdminLogin;
