import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AdminLogin from "../pages/admin/AdminLogin";

// Shows the admin login screen at /admin until the owner has signed in.
const ProtectedRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="animate-spin text-plum" size={40} />
      </div>
    );
  }

  return isAdmin ? children : <AdminLogin />;
};

export default ProtectedRoute;
