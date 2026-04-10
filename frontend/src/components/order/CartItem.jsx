// src/components/order/CartItem.jsx
import React from 'react';

const CartItem = ({ item, onUpdate, onRemove }) => {
  return (
    <div className="flex items-start justify-between py-3 border-b border-orange-50 last:border-0">
      <div className="flex-1 pr-4">
        <h4 className="text-sm font-semibold text-[#333333]">{item.name}</h4>
        <p className="text-xs text-[#9E9E9E] mt-0.5">{item.variant} • ₹{item.price}</p>
      </div>
      <div className="flex items-center gap-2 bg-white border border-orange-100 rounded-lg overflow-hidden">
        <button onClick={() => item.quantity === 1 ? onRemove(item.cartId) : onUpdate(item.cartId, item.quantity - 1)} className="px-2.5 py-1 text-[#9E9E9E] hover:bg-[#FFF5E9] transition-colors font-bold">−</button>
        <span className="px-2 text-sm font-semibold text-[#333333] min-w-[20px] text-center">{item.quantity}</span>
        <button onClick={() => onUpdate(item.cartId, item.quantity + 1)} className="px-2.5 py-1 text-[#9E9E9E] hover:bg-[#FFF5E9] transition-colors font-bold">+</button>
      </div>
    </div>
  );
};

export default CartItem;
