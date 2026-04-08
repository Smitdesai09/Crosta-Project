import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Auth Pages (eager — small, need to load instantly)
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// App Pages (lazy — heavy modules, load on demand)
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Orders = React.lazy(() => import("./pages/Orders"));
const BillHistory = React.lazy(() => import("./pages/BillHistory"));
const ProductManagement = React.lazy(() => import("./pages/ProductManagement"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));

// Design-system-compliant Suspense fallback
const SuspenseFallback = () => (
  <div className="flex items-center justify-center py-10">
    <span className="animate-pulse text-text-secondary">Loading...</span>
  </div>
);

const GlobalShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        const key = event.key.toLowerCase();

        const shortcuts = {
          o: "/orders",
          b: "/bill-history",
          p: "/product-management",
        };

        if (shortcuts[key]) {
          event.preventDefault();
          event.stopPropagation();

          const activeTag = document.activeElement.tagName.toLowerCase();
          const isTyping =
            activeTag === "input" ||
            activeTag === "textarea" ||
            document.activeElement.isContentEditable;

          if (!isTyping) {
            navigate(shortcuts[key]);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [navigate]);

  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalShortcuts />
        <Routes>
          {/* ---------- Public Auth Routes ---------- */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <GuestRoute>
                <ResetPassword />
              </GuestRoute>
            }
          />

          {/* ---------- Protected App Routes ---------- */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <React.Suspense fallback={<SuspenseFallback />}>
                  <Dashboard />
                </React.Suspense>
              }
            />
            <Route
              path="orders"
              element={
                <React.Suspense fallback={<SuspenseFallback />}>
                  <Orders />
                </React.Suspense>
              }
            />
            <Route
              path="bill-history"
              element={
                <React.Suspense fallback={<SuspenseFallback />}>
                  <BillHistory />
                </React.Suspense>
              }
            />
            <Route
              path="product-management"
              element={
                <React.Suspense fallback={<SuspenseFallback />}>
                  <ProductManagement />
                </React.Suspense>
              }
            />
            <Route
              path="analytics"
              element={
                <React.Suspense fallback={<SuspenseFallback />}>
                  <Analytics />
                </React.Suspense>
              }
            />
            <Route
              path="admin-panel"
              element={
                <React.Suspense fallback={<SuspenseFallback />}>
                  <AdminPanel />
                </React.Suspense>
              }
            />
          </Route>

          {/* ---------- 404 Catch-All ---------- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;