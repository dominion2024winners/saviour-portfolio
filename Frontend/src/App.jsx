import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import BlogDetail from "./pages/BlogDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { trackAnalyticsEvent } from "./utils/analytics";

import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function MaintenancePage() {
  return (
    <main className="maintenance-page">
      <div className="maintenance-card">
        <span className="maintenance-tag">MAINTENANCE MODE</span>
        <h1>Website temporarily unavailable</h1>
        <p>
          We are making updates to the portfolio. Please check back soon.
        </p>
      </div>
    </main>
  );
}

// ============================================================
// PROTECTED ADMIN ROUTE
// ============================================================

function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

// ============================================================
// APP
// ============================================================

function App() {
  const [websiteEnabled, setWebsiteEnabled] = useState(true);
  const [statusChecked, setStatusChecked] = useState(() => {
    const path = window.location.pathname;
    return path.startsWith("/admin") || path === "/login";
  });

  useEffect(() => {
    const storedTheme = localStorage.getItem("portfolioTheme") || "light";
    document.documentElement.dataset.theme = storedTheme;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSiteStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/site-status`);
        const data = await response.json();

        if (!isMounted) {
          return;
        }

        setWebsiteEnabled(data?.siteStatus?.websiteEnabled ?? true);
      } catch (error) {
        console.warn("Unable to load site status.", error);

        if (isMounted) {
          setWebsiteEnabled(true);
        }
      } finally {
        if (isMounted) {
          setStatusChecked(true);
        }
      }
    };

    loadSiteStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (statusChecked) {
      trackAnalyticsEvent({
        type: "page_view",
        path: window.location.pathname,
      });
    }
  }, [statusChecked]);

  if (!statusChecked) {
    return <div className="loading-state">Loading portfolio…</div>;
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* ==================================================
            PUBLIC PORTFOLIO
            ================================================== */}

        <Route path="/" element={websiteEnabled ? <Home /> : <MaintenancePage />} />
        <Route path="/projects/:projectId" element={websiteEnabled ? <ProjectDetail /> : <MaintenancePage />} />
        <Route path="/blog/:postId" element={websiteEnabled ? <BlogDetail /> : <MaintenancePage />} />

        {/* ==================================================
            ADMIN LOGIN
            ================================================== */}

        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ==================================================
            PROTECTED ADMIN DASHBOARD
            ================================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        {/* ==================================================
            404
            ================================================== */}

        <Route
          path="*"
          element={
            <div className="not-found">
              <h1>404</h1>
              <p>Page not found.</p>
              <a href="/">Back to Portfolio</a>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;