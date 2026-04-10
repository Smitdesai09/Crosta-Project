import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  
  const variants = {
    // Primary Action (Reserved for special CTAs)
    primary: "bg-[#ff6d33] hover:bg-orange-700 text-white focus:ring-[#ff6d33]/50 shadow-sm",
    // Secondary/Quantity Action (Clean & Neutral)
    secondary: "bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 focus:ring-neutral-300",
    // Danger Action
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm",
    // Success Action
    success: "bg-[#2E7D32] hover:bg-green-700 text-white focus:ring-[#2E7D32]/50 shadow-sm",
    // Ghost Action
    ghost: "bg-transparent hover:bg-neutral-100 text-neutral-500 focus:ring-neutral-200"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default Button;