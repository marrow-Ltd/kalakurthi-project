import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SiteConfigProvider } from "./context/SiteConfigContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SiteConfigProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </SiteConfigProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#FDFBF7",
              color: "#4E1327",
              border: "1px solid #E8B4B8",
              fontFamily: "Poppins, sans-serif",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
