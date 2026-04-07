import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  
  const variants = {
    // Primary Action: #FF6D33 bg, #FFFFFF text
    primary: "bg-brand hover:bg-brand-hover text-surface-white focus:ring-brand/50 shadow-sm",
    // Secondary/Quantity Action: #FFFFFF bg, #E8E8E8 border, #111111 text
    secondary: "bg-surface-white hover:bg-surface-gray text-text-primary border border-border-main focus:ring-border-main",
    danger: "bg-red-600 hover:bg-red-700 text-surface-white focus:ring-red-500 shadow-sm",
    success: "bg-emerald-500 hover:bg-emerald-600 text-surface-white focus:ring-emerald-500 shadow-sm",
    ghost: "bg-transparent hover:bg-surface-gray text-text-secondary focus:ring-border-main"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default Button;