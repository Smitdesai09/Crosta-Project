import React from 'react';

const TableCard = ({ table, onClick }) => {
  const isOccupied = table.status === 'Occupied';

  // Empty: Dashed border, hover invites click. Occupied: Solid border.
  const cardStyles = isOccupied
    ? 'bg-surface-white border-2 border-border-main hover:border-gray-300 hover:shadow-lg'
    : 'bg-surface-white border-2 border-dashed border-border-main hover:border-brand hover:bg-brand-pale/30 hover:shadow-lg';

  // eslint-disable-next-line no-unused-vars
  const headerColor = isOccupied ? 'text-orange-600' : 'text-gray-500';

  return (
    <div
      onClick={() => onClick(table.id)}
      className={`flex flex-col items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 h-44 group ${cardStyles}`}
    >
      {/* Top Center: Table Name + Red Live Dot */}
      <div className="text-sm font-bold tracking-wide flex items-center gap-2 ${headerColor}">
        {isOccupied && (
          <span className="relative flex h-2 w-2">
            {/* Changed to Red */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
        Table-{table.id}
      </div>

      {/* Middle: Icon vs Action */}
      <div className="flex-1 flex items-center justify-center w-full">
        {isOccupied ? (
          <svg className="w-11 h-11 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        ) : (
          // Empty state: Plus icon and text
          <div className="flex flex-col items-center text-gray-300 group-hover:text-brand transition-colors">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px] font-semibold mt-1">Tap to Create Order</span>
          </div>
        )}
      </div>

      {/* Bottom: Order Details vs Available Pill */}
      <div className="w-full text-center">
        {isOccupied ? (
          <div className="space-y-1">
            {/* NEW: Order Type Pill */}
            <span className="inline-block px-2 py-[2px] text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-200 rounded-full">
              {table.orderType === 'dine-in' ? 'Dine-in' : 'Takeaway'}
            </span>
            {/* Slightly bigger subtotal to spot high-value tables */}
            <p className="text-xl font-extrabold text-text-primary">₹{table.subtotal.toFixed(2)}</p>
          </div>
        ) : (
          // "Available" pill turns orange on hover to invite waiter
          <span className="inline-block bg-green-50 text-green-600 border border-green-200 px-3 py-[2px] rounded-full text-[10px] font-bold uppercase tracking-wider group-hover:bg-brand-pale group-hover:text-brand group-hover:border-brand transition-all">
            Available
          </span>
        )}
      </div>
    </div>
  );
};

export default TableCard;