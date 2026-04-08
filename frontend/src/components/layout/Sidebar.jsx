import React from 'react';
import SidebarItem from './SidebarItem';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../context/AuthContext';

import brandLogo from '../../assets/logo.png';

const Icons = {
  dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>,
  orders: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  bills: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  products: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  analytics: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  admin: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  logout: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>,
  addUser: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
};

const Sidebar = ({ isCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  
  // ✅ ADDED: Extract permissions from the hook
  const { VIEW_ANALYTICS, VIEW_ADMIN_PANEL , CAN_REGISTER_USER } = usePermissions();

  const menuItems = [
    { icon: Icons.dashboard, label: "Dashboard", path: "/" },
    { icon: Icons.orders, label: "Orders", path: "/orders" },
    { icon: Icons.bills, label: "Bill History", path: "/bill-history" },
    { icon: Icons.products, label: "Products", path: "/product-management" },
    
    // ✅ FIXED: Changed PERMISSIONS.VIEW_... to VIEW_...
    ...(VIEW_ANALYTICS ? [{ icon: Icons.analytics, label: "Analytics", path: "/analytics" }] : []),
    ...(CAN_REGISTER_USER ? [{ icon: Icons.addUser, label: "Register Operator", path: "/admin/register-user" }] : []),
    ...(VIEW_ADMIN_PANEL ? [{ icon: Icons.admin, label: "Admin Panel", path: "/admin-panel" }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-neutral-deep">
      {/* Logo Area */}
      <div className={`flex items-center h-20 px-3 py-4 border-b border-white/10 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
        <img 
          src={brandLogo} 
          alt="Crosta Logo" 
          className={`object-contain transition-all duration-300 ${isCollapsed ? 'w-14 h-14' : 'w-40 h-14'}`} 
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.path} 
            icon={item.icon} 
            label={item.label} 
            path={item.path} 
            isCollapsed={isCollapsed} 
            onClick={() => setIsMobileOpen(false)}
          />
        ))}
      </nav>

      {/* User Info & Logout — pinned to bottom */}
      <div className={`border-t border-white/10 ${isCollapsed ? 'p-3' : 'p-4'}`}>
        {isCollapsed ? (
          /* Collapsed state — just avatar + logout icon stacked */
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-surface-white text-sm font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-text-secondary hover:bg-white/10 hover:text-white transition-colors"
              title="Sign Out"
            >
              {Icons.logout}
            </button>
          </div>
        ) : (
          /* Expanded state — full user row + logout button */
          <>
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-surface-white text-sm font-bold shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-white/10 hover:text-white transition-colors text-sm"
            >
              {Icons.logout}
              Sign Out
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className={`hidden lg:block h-screen sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {sidebarContent}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 z-50">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;

