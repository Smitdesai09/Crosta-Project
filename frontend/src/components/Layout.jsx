import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface-gray overflow-hidden">
      
      {/* SIDEBAR */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* MAIN AREA (No Navbar) */}
      <main className="flex-1 overflow-y-scroll p-4 lg:p-6">
        <Outlet />
      </main>

    </div>
  );
};

export default Layout;