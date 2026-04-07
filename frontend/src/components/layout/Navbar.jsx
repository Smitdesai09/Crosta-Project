import React from 'react';
import ProfileDropdown from './ProfileDropdown';

const Navbar = ({ onMenuClick, isSidebarCollapsed, setIsSidebarCollapsed, isMobileOpen, setIsMobileOpen }) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-surface-white border-b border-border-main flex items-center justify-between px-4 lg:px-6">
      
      {/* LEFT SIDE: Only the Hamburger Menu */}
      <div className="flex items-center gap-3">
        
        {/* Mobile Hamburger */}
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-gray hover:text-text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop Hamburger (with active background state) */}
        <button 
          onClick={() => {
            setIsSidebarCollapsed(!isSidebarCollapsed);
            if(isMobileOpen) setIsMobileOpen(false);
          }}
          className={`hidden lg:flex items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
            isSidebarCollapsed 
              ? 'bg-surface-gray text-text-primary' 
              : 'text-text-secondary hover:bg-surface-gray hover:text-text-primary'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* RIGHT SIDE: Only the Profile Dropdown */}
      <div className="flex items-center gap-4">
        <ProfileDropdown />
      </div>

    </header>
  );
};

export default Navbar;