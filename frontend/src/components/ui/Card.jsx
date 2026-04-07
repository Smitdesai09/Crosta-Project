import React from 'react';

const Card = ({ children, className = '', padding = true }) => {
  return (
    <div className={`bg-surface-white rounded-xl shadow-sm border border-border-main ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;