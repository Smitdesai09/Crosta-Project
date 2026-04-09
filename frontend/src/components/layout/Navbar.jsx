import React from 'react';
import { useLocation } from 'react-router-dom';
// Adjust this path if your Navbar file is in a different folder!
import brandLogo from '../../assets/logo.png';

const pageTitles = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/bill-history": "Bill History",
  "/product-management": "Products",
  "/analytics": "Analytics",
  "/admin/register-user": "Register User",
  "/admin-panel": "Admin Panel",
};

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const currentPageTitle = pageTitles[location.pathname] || "Dashboard";

  return (
    // Changed h-14 to h-16 here to match sidebar top padding/border
    <header className="sticky top-0 z-30 h-16 bg-surface-white border-b border-border-main flex items-center justify-between px-4 lg:px-6">
      
      {/* Left: Mobile Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-gray hover:text-text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        
        <h1 className="text-xl font-bold text-text-primary tracking-tight hidden sm:block">
          {currentPageTitle}
        </h1>
      </div>

      {/* Right: Restaurant Logo */}
      <div className="flex items-center">
        <img 
          src={brandLogo} 
          alt="Crosta Logo" 
          className="h-12 object-contain" 
        />
      </div>
    </header>
  );
};

export default Navbar;
