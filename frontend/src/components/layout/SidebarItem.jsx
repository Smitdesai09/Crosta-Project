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
            ? 'bg-red-500/25 text-red-400 font-semibold'
            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        } ${
          isCollapsed ? 'w-10 h-10 mx-auto justify-center' : 'px-3 py-2.5'
        }`
      }
    >
      <span className="flex-shrink-0">{icon}</span>
      
      <div className={`grid transition-[grid-template-columns] duration-300 ${isCollapsed ? '' : 'ml-3'}`} style={{ gridTemplateColumns: isCollapsed ? '0fr' : '1fr' }}>
        <span className="whitespace-nowrap text-sm overflow-hidden">{label}</span>
      </div>
    </NavLink>
  );
};

export default SidebarItem;