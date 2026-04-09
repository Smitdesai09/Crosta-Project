import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarItem = ({ icon, label, path, isCollapsed, onClick }) => {
  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center rounded-lg transition-all duration-200 group ${
          isActive
            ? 'bg-brand-pale text-brand font-semibold' 
            : 'text-white/70 hover:bg-neutral-dark hover:text-surface-white'
        } ${
          isCollapsed ? 'w-10 h-10 mx-auto justify-center' : 'px-3 py-2.5'
        }`
      }
    >
      <span className="flex-shrink-0">{icon}</span>
      
      {/* FIX: Removed gap-3 from parent. Added conditional ml-3 here instead */}
      <div className={`grid transition-[grid-template-columns] duration-300 ${isCollapsed ? '' : 'ml-3'}`} style={{ gridTemplateColumns: isCollapsed ? '0fr' : '1fr' }}>
        <span className="whitespace-nowrap text-sm overflow-hidden">{label}</span>
      </div>
    </NavLink>
  );
};

export default SidebarItem;