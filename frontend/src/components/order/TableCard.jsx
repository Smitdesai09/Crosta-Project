// src/components/order/TableCard.jsx
import React from 'react';

const TableCard = ({ table, onClick }) => {
  const isAvailable = table.status === 'Available';
  return (
    <button
      onClick={() => onClick(table.id)}
      disabled={!isAvailable}
      className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 
        ${isAvailable ? 'bg-surface-white border-border-main hover:border-brand hover:shadow-md cursor-pointer' : 'bg-surface-gray border-border-main cursor-not-allowed opacity-60'}`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isAvailable ? 'bg-brand-pale' : 'bg-gray-200'}`}>
        <span className={`text-lg font-bold ${isAvailable ? 'text-brand' : 'text-gray-400'}`}>{table.id}</span>
      </div>
      <span className={`text-sm font-medium ${isAvailable ? 'text-text-primary' : 'text-text-secondary'}`}>Table {table.id}</span>
      <span className={`text-xs mt-1 px-2 py-0.5 rounded-full ${isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>{table.status}</span>
    </button>
  );
};

export default TableCard;