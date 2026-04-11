import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* SIDEBAR */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* #faaa66
      #fbb980 */}
      {/* MAIN AREA */}
      <main className="flex-1 overflow-y-scroll bg-[#fbb980]">
        <Outlet />
      </main>

    </div>
  );
};

export default Layout;