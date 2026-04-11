import React from 'react';

const TableCard = ({ table, onClick }) => {
  const isOccupied = table.status === 'Occupied';

  const cardStyles = isOccupied
    ? 'bg-white border-2 border-black hover:shadow-lg'
    : 'bg-white border-2 border-dashed border-black/40 hover:border-black hover:shadow-lg';

  return (
    <div
      onClick={() => onClick(table.id)}
      className={`flex flex-col items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 h-44 group ${cardStyles}`}
    >
      {/* Table Name: Grey to black on hover */}
      <div className={`text-sm font-bold tracking-wide flex items-center gap-2 ${isOccupied ? 'text-black' : 'text-black/40 group-hover:text-black'} transition-colors`}>
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
          <svg className="w-11 h-11 text-[#fbb980]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        ) : (
          /* Plus icon & text: Grey to black on hover */
          <div className="flex flex-col items-center text-black/20 group-hover:text-black transition-colors">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px] font-semibold mt-1">Tap to Create Order</span>
          </div>
        )}
      </div>

      <div className="w-full text-center">
        {isOccupied ? (
          <div className="space-y-1">
            <span className="inline-block px-2 py-[2px] text-[10px] font-bold uppercase tracking-wider bg-black/5 text-black/70 border border-black/20 rounded-full">
              {table.orderType === 'dine-in' ? 'Dine-in' : 'Takeaway'}
            </span>
            <p className="text-xl font-extrabold text-[#333333]">₹{table.subtotal.toFixed(2)}</p>
          </div>
        ) : (
          /* Green pill: Stays exactly the same on hover */
          <span className="inline-block bg-green-100 text-green-800 border border-green-300 px-3 py-[2px] rounded-full text-[10px] font-bold uppercase tracking-wider">
            Available
          </span>
        )}
      </div>
    </div>
  );
};

export default TableCard;