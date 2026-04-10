// src/components/Button.jsx
import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  
  const variants = {
    // Primary Action
    primary: "bg-[#FF7A00] hover:bg-orange-600 text-white focus:ring-[#FF7A00]/50 shadow-sm",
    // Secondary/Quantity Action
    secondary: "bg-white hover:bg-[#FFF5E9] text-[#333333] border border-orange-100 focus:ring-orange-200",
    // Danger Action
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm",
    // Success Action (Mapped to Mint Green from official palette)
    success: "bg-[#2E7D32] hover:bg-green-700 text-white focus:ring-[#2E7D32] shadow-sm",
    // Ghost Action
    ghost: "bg-transparent hover:bg-[#FFF5E9] text-[#9E9E9E] focus:ring-orange-200"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default Button;
