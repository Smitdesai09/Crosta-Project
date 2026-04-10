import React from 'react';

const Card = ({ children, className = '', padding = true }) => {
  return (
    // FIX: Updated to neutral border to match the new system
    <div className={`bg-white rounded-xl shadow-sm border border-neutral-200 ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;