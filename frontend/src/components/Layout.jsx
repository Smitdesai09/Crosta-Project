import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Navbar from './layout/Navbar';

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
    // 1. Changed min-h-screen to h-screen
    <div className="flex h-screen bg-surface-gray overflow-hidden">
      
      {/* SIDEBAR */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* NAVBAR */}
        <Navbar 
          onMenuClick={() => setIsMobileOpen(true)} 
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
        
        {/* 2. Changed overflow-y-auto to overflow-y-scroll */}
        <main className="flex-1 overflow-y-scroll p-4 lg:p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};


export default Layout;
