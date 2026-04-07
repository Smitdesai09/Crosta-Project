import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Orders = React.lazy(() => import('./pages/Orders'));
const BillHistory = React.lazy(() => import('./pages/BillHistory'));
const ProductManagement = React.lazy(() => import('./pages/ProductManagement'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));

const GlobalShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        const key = event.key.toLowerCase();

        const shortcuts = {
          'o': '/orders',
          'b': '/bill-history',
          'p': '/product-management', // Ctrl+P mapped here
        };

        if (shortcuts[key]) {
          // This completely stops the browser from opening the print dialog
          event.preventDefault();
          event.stopPropagation(); // Extra safety to ensure it doesn't bubble up

          const activeTag = document.activeElement.tagName.toLowerCase();
          const isTyping = activeTag === 'input' || activeTag === 'textarea' || document.activeElement.isContentEditable;

          if (!isTyping) {
            navigate(shortcuts[key]);
          }
        }
      }
    };

    // We use 'capture: true' so this intercepts the shortcut BEFORE the browser can act on it
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [navigate]);

  return null;
};

function App() {
  return (
    <Router>
      <GlobalShortcuts />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<React.Suspense fallback="Loading..."><Dashboard /></React.Suspense>} />
          <Route path="orders" element={<React.Suspense fallback="Loading..."><Orders /></React.Suspense>} />
          <Route path="bill-history" element={<React.Suspense fallback="Loading..."><BillHistory /></React.Suspense>} />
          <Route path="product-management" element={<React.Suspense fallback="Loading..."><ProductManagement /></React.Suspense>} />
          <Route path="analytics" element={<React.Suspense fallback="Loading..."><Analytics /></React.Suspense>} />
          <Route path="admin-panel" element={<React.Suspense fallback="Loading..."><AdminPanel /></React.Suspense>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;