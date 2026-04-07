// src/components/order/OrderTypeCard.jsx
import React from 'react';

const OrderTypeCard = ({ type, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition-all duration-200 ${
        isActive ? 'bg-brand-pale border-brand text-brand' : 'bg-surface-white border-border-main text-text-secondary hover:border-gray-300'
      }`}
    >
      {type}
    </button>
  );
};

export default OrderTypeCard;