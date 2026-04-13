import React from 'react';
import SidebarItem from './SidebarItem';
import { usePermissions } from '../../lib/usePermissions';
import { useAuth } from '../../lib/AuthContext';
import brandLogo from '../../assets/logo3.png';

const Icons = {
  dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>,
  orders: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  bills: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  products: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  analytics: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  admin: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  logout: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>,
};

const Sidebar = ({ isCollapsed, isMobileOpen, setIsMobileOpen, setIsSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { VIEW_ANALYTICS, VIEW_ADMIN_PANEL } = usePermissions();

  const menuItems = [
    { icon: Icons.dashboard, label: "Dashboard", path: "/" },
    { icon: Icons.orders, label: "Orders", path: "/orders" },
    { icon: Icons.bills, label: "Bill History", path: "/bill-history" },
    { icon: Icons.products, label: "Products", path: "/product-management" },
    ...(VIEW_ANALYTICS ? [{ icon: Icons.analytics, label: "Analytics", path: "/analytics" }] : []),
    ...(VIEW_ADMIN_PANEL ? [{ icon: Icons.admin, label: "Admin Panel", path: "/admin-panel" }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    setIsMobileOpen(false);
  };

  const toggleCollapse = () => {
    setIsSidebarCollapsed(!isCollapsed);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const handleItemClick = () => {
    setIsMobileOpen(false);
    setIsSidebarCollapsed(true);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gray-900">

      <div className={`flex items-center h-16 shrink-0 px-3 border-b border-gray-800 transition-all ${isCollapsed ? 'justify-center' : 'justify-between'}`}>

        <div className="grid transition-[grid-template-columns] duration-300" style={{ gridTemplateColumns: isCollapsed ? '0fr' : '1fr' }}>
          <div className="overflow-hidden min-w-0">
            <img src={brandLogo} alt="Crosta Logo" className="h-12 object-contain" />
          </div>
        </div>

        <button onClick={toggleCollapse} className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isCollapsed={isCollapsed}
            onClick={handleItemClick}
          />
        ))}
      </nav>

      <div className="border-t border-gray-800 p-4 shrink-0">

        <div className={`flex items-center mb-3 ${isCollapsed ? 'w-10 h-10 mx-auto justify-center' : 'px-1'}`}>
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className={`grid transition-[grid-template-columns] duration-300 ${isCollapsed ? '' : 'ml-3'}`} style={{ gridTemplateColumns: isCollapsed ? '0fr' : '1fr' }}>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={`flex items-center rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors text-sm cursor-pointer ${
            isCollapsed ? 'w-10 h-10 mx-auto justify-center' : 'w-full px-3 py-2.5'
          }`}
        >
          {Icons.logout}
          <div className={`grid transition-[grid-template-columns] duration-300 ${isCollapsed ? '' : 'ml-3'}`} style={{ gridTemplateColumns: isCollapsed ? '0fr' : '1fr' }}>
            <span className="whitespace-nowrap overflow-hidden">Sign Out</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={`hidden lg:block h-screen sticky top-0 flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
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