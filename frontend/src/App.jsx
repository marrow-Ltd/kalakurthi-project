import { useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Categories from "./pages/Categories";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Gallery from "./pages/Gallery";
import CustomOrder from "./pages/CustomOrder";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductsManager from "./pages/admin/ProductsManager";
import SlidesManager from "./pages/admin/SlidesManager";
import CategoriesManager from "./pages/admin/CategoriesManager";
import ServiceManager from "./pages/admin/ServiceManager";
import GalleryManager from "./pages/admin/GalleryManager";
import OrdersManager from "./pages/admin/OrdersManager";
import SiteConfigManager from "./pages/admin/SiteConfigManager";
import TestimonialsManager from "./pages/admin/TestimonialsManager";

// Scroll to top on page change (or to #section when the link has one)
const ScrollManager = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 80);
      return () => clearTimeout(timer);
    }
    window.scrollTo({ top: 0 });
    return undefined;
  }, [pathname, hash]);
  return null;
};

// Everything customers see: top bar, page, footer, bottom tab bar, WhatsApp button
const PublicLayout = () => {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-cream pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <Header />
      <main className="flex-1">
        <div key={pathname} className="animate-fadeIn">
          <Outlet />
        </div>
      </main>
      <Footer />
      <BottomNav />
      <FloatingWhatsApp />
    </div>
  );
};

function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="categories" element={<Categories />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="custom-order" element={<CustomOrder />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Protected admin panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsManager />} />
          <Route path="slides" element={<SlidesManager />} />
          <Route path="categories" element={<CategoriesManager />} />
          <Route path="services" element={<ServiceManager />} />
          <Route path="gallery" element={<GalleryManager />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="site-config" element={<SiteConfigManager />} />
          <Route path="testimonials" element={<TestimonialsManager />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
