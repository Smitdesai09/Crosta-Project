import React from 'react';

const CartItem = ({ item, onUpdate, onRemove }) => {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 pr-4">
        <h4 className="text-sm font-semibold text-[#333333]">{item.name}</h4>
        <p className="text-xs text-gray-400 mt-0.5">{item.variant} • ₹{item.price}</p>
      </div>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button onClick={() => item.quantity === 1 ? onRemove(item.cartId) : onUpdate(item.cartId, item.quantity - 1)} className="px-2.5 py-1 text-gray-400 hover:bg-gray-100 transition-colors font-bold">−</button>
        <span className="px-2 text-sm font-semibold text-[#333333] min-w-[20px] text-center">{item.quantity}</span>
        <button onClick={() => onUpdate(item.cartId, item.quantity + 1)} className="px-2.5 py-1 text-gray-400 hover:bg-gray-100 transition-colors font-bold">+</button>
      </div>
    </div>
  );
};

export default CartItem;