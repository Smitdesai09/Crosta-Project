import React from 'react';

const OrderTypeCard = ({ type, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition-colors ${
        isActive ? 'bg-red-50 border-red-500 text-red-500' : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
      }`}
    >
      {type}
    </button>
  );
};

export default OrderTypeCard;