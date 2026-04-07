import React, { useState, useRef, useEffect } from 'react';
import { user } from '../../constants/auth';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-gray transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-surface-white font-bold text-sm">
          {user.name.charAt(0)}
        </div>
        <span className="hidden md:block text-sm font-medium text-text-primary">{user.name}</span>
        <svg className="w-4 h-4 text-text-secondary hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface-white rounded-xl shadow-lg border border-border-main py-3 z-50">
          
          {/* User Info Section */}
          <div className="px-4 pb-3">
            <p className="text-sm font-bold text-text-primary">{user.name}</p>
            <p className="text-sm text-text-secondary mt-0.5">{user.email}</p>
            <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-pale text-brand rounded-full">{user.role}</span>
          </div>

          {/* Logout Button - Clean rounded rectangle on hover */}
          <div className="px-4 pt-2">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-brand hover:bg-brand-pale rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;