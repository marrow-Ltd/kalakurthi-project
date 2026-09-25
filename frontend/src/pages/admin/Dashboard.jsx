import { useEffect, useState } from "react";
import { ShoppingBag, Images, LayoutGrid, Scissors, Image, ClipboardList, MessageSquareQuote, Clock } from "lucide-react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import { useSiteConfig } from "../../context/SiteConfigContext";

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to} className="craft-card p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={22} />
    </div>
    <div className="min-w-0">
      <p className="text-xl font-display font-semibold text-plum">{value}</p>
      <p className="text-xs text-plum-dark/60 truncate">{label}</p>
    </div>
  </Link>
);

const Dashboard = () => {
  const { brandName } = useSiteConfig();
  const [stats, setStats] = useState({ products: 0, slides: 0, categories: 0, services: 0, gallery: 0, orders: 0, testimonials: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [products, slides, cats, services, gallery, orders, testimonials] = await Promise.all([
          api.get("/products/all"),
          api.get("/slides/all"),
          api.get("/categories/all"),
          api.get("/services/all"),
          api.get("/gallery/all"),
          api.get("/orders"),
          api.get("/testimonials/all"),
        ]);
        setStats({
          products: products.data.length,
          slides: slides.data.length,
          categories: cats.data.length,
          services: services.data.length,
          gallery: gallery.data.length,
          orders: orders.data.length,
          testimonials: testimonials.data.length,
        });
        setRecentOrders(orders.data.slice(0, 5));
      } catch {
        // page still renders with 0s
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusColor = {
    Pending: "bg-gold/20 text-plum-dark",
    "In Progress": "bg-terracotta/20 text-terracotta",
    Completed: "bg-olive/20 text-olive",
    Cancelled: "bg-red-100 text-red-500",
  };

  const v = (n) => (loading ? "…" : n);

  return (
    <div>
      <h1 className="font-display text-3xl text-plum font-semibold mb-1">Welcome back 🧵</h1>
      <p className="text-plum-dark/60 mb-8">Here's what's happening at {brandName} today.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={ShoppingBag} label="Products" value={v(stats.products)} color="bg-blush/40 text-plum" to="/admin/products" />
        <StatCard icon={Images} label="Home Slides" value={v(stats.slides)} color="bg-terracotta/20 text-terracotta" to="/admin/slides" />
        <StatCard icon={LayoutGrid} label="Categories" value={v(stats.categories)} color="bg-gold/20 text-gold" to="/admin/categories" />
        <StatCard icon={ClipboardList} label="Total Orders" value={v(stats.orders)} color="bg-olive/20 text-olive" to="/admin/orders" />
        <StatCard icon={Scissors} label="Services" value={v(stats.services)} color="bg-blush/40 text-plum" to="/admin/services" />
        <StatCard icon={Image} label="Gallery Items" value={v(stats.gallery)} color="bg-terracotta/20 text-terracotta" to="/admin/gallery" />
        <StatCard icon={MessageSquareQuote} label="Testimonials" value={v(stats.testimonials)} color="bg-gold/20 text-gold" to="/admin/testimonials" />
      </div>

      <div className="craft-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-plum font-semibold flex items-center gap-2">
            <Clock size={20} className="text-terracotta" /> Recent Orders
          </h2>
          <Link to="/admin/orders" className="text-sm text-terracotta font-medium hover:underline">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-plum-dark/50 text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-plum-dark/50 border-b border-plum/10">
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Service</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id} className="border-b border-plum/5 last:border-0">
                    <td className="py-3 text-plum-dark">{o.name}</td>
                    <td className="py-3 text-plum-dark/70">{o.serviceType}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[o.status]}`}>{o.status}</span>
                    </td>
                    <td className="py-3 text-plum-dark/50">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
