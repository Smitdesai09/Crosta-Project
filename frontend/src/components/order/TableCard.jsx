import React from 'react';

const getTimeElapsed = (createdAt) => {
  if (!createdAt) return '';
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
};

const TableCard = ({ table, onClick }) => {
  const isOccupied = table.status === 'Occupied';

  const cardStyles = isOccupied
    ? 'bg-white border-2 border-gray-900 hover:shadow-lg'
    : 'bg-white border-2 border-dashed border-gray-300 hover:border-gray-900 hover:shadow-lg';

  return (
    <div
      onClick={() => onClick(table.id)}
      className={`relative flex flex-col items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 h-44 group ${cardStyles}`}
    >
      <div className={`text-sm font-bold tracking-wide flex items-center gap-2 ${isOccupied ? 'text-gray-900' : 'text-gray-300 group-hover:text-gray-900'} transition-colors`}>
        {isOccupied && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
        Table-{table.id}
      </div>

      <div className="flex-1 flex items-center justify-center w-full">
        {isOccupied ? (
          <svg className="w-11 h-11 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        ) : (
          <div className="flex flex-col items-center text-gray-300 group-hover:text-gray-900 transition-colors">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px] font-semibold mt-1">Tap to Create Order</span>
          </div>
        )}
      </div>

      <div className="w-full flex items-end justify-between">
        {isOccupied ? (
          <>
            <div className="space-y-1">
              <span className="inline-block px-2 py-[2px] text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 rounded-full">
                {table.displayOrderId}
              </span>
              <p className="text-xl font-extrabold text-gray-900">₹{table.subtotal.toFixed(2)}</p>
            </div>
            <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {getTimeElapsed(table.createdAt)}
            </span>
          </>
        ) : (
          <span className="inline-block bg-green-100 text-green-800 px-3 py-[2px] rounded-full text-[10px] font-bold uppercase tracking-wider">
            Available
          </span>
        )}
      </div>
    </div>
  );
};

export default TableCard;