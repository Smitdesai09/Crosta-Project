import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarItem = ({ icon, label, path, isCollapsed, onClick }) => {
  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
          isActive
            // Active: #333333 bg OR #FF6D33 highlight. Let's use the Pale Orange bg + Orange text for a modern look
            ? 'bg-brand-pale text-brand font-semibold' 
            // Inactive: #757575 text
            : 'text-text-secondary hover:bg-neutral-dark hover:text-surface-white'
        } ${isCollapsed ? 'justify-center' : ''}`
      }
    >
      <span className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>{icon}</span>
      {!isCollapsed && <span className="whitespace-nowrap text-sm">{label}</span>}
    </NavLink>
  );
};

export default SidebarItem;