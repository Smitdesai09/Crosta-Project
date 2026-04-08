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
            ? 'bg-brand-pale text-brand font-semibold' 
            : 'text-white/70 hover:bg-neutral-dark hover:text-surface-white' // Brightened inactive text
        } ${isCollapsed ? 'justify-center' : ''}`
      }
    >
      <span className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>{icon}</span>
      {!isCollapsed && <span className="whitespace-nowrap text-sm">{label}</span>}
    </NavLink>
  );
};

export default SidebarItem;