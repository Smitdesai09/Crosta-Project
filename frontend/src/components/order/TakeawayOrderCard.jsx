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

const TakeawayOrderCard = ({ order, onClick }) => {
  return (
    <div
      onClick={() => onClick(order)}
      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">{order.orderId}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-lg font-extrabold text-gray-900">₹{order.subtotal.toFixed(2)}</span>
        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
          {getTimeElapsed(order.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default TakeawayOrderCard;