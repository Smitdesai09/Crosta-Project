import React from 'react';

const TableCard = ({ table, onClick }) => {
  const isOccupied = table.status === 'Occupied';
  
  const cardStyles = isOccupied 
    ? 'bg-orange-50 border-2 border-orange-300 hover:border-orange-400 hover:shadow-lg' 
    : 'bg-surface-white border-2 border-border-main hover:border-gray-300 hover:shadow-lg';
    
  const headerColor = isOccupied ? 'text-orange-600' : 'text-gray-500';
  const iconColor = isOccupied ? 'text-orange-300' : 'text-gray-300';

  return (
    <div
      onClick={() => onClick(table.id)}
      className={`flex flex-col items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 h-44 ${cardStyles}`}
    >
      {/* Top Center: Table Name */}
      <div className={`text-sm font-bold tracking-wide ${headerColor}`}>
        Table-{table.id}
      </div>

      {/* Middle: Icon */}
      <div className="flex-1 flex items-center justify-center w-full">
        {isOccupied ? (
          <svg className={`w-11 h-11 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        ) : (
          <svg className={`w-12 h-12 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        )}
      </div>

      {/* Bottom: Order Details or Available Pill */}
      <div className="w-full text-center">
        {isOccupied ? (
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-text-primary">{table.orderId}</p>
            <p className="text-lg font-bold text-text-primary">₹{table.subtotal.toFixed(2)}</p>
          </div>
        ) : (
          <span className="inline-block bg-green-50 text-green-600 border border-green-200 px-3 py-[2px] rounded-full text-[10px] font-bold uppercase tracking-wider">
            Available
          </span>
        )}
      </div>
    </div>
  );
};

export default TableCard;