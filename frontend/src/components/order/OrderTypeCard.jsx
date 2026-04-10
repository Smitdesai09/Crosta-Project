// src/components/order/OrderTypeCard.jsx
import React from 'react';

const OrderTypeCard = ({ type, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition-all duration-200 ${
        isActive ? 'bg-[#FFF5E9] border-[#FF7A00] text-[#FF7A00]' : 'bg-white border-orange-100 text-[#9E9E9E] hover:border-orange-300'
      }`}
    >
      {type}
    </button>
  );
};

export default OrderTypeCard;
