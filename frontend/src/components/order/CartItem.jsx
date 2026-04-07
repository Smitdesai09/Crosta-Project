// src/components/order/CartItem.jsx
import React from 'react';

const CartItem = ({ item, onUpdate, onRemove }) => {
  return (
    <div className="flex items-start justify-between py-3 border-b border-border-main last:border-0">
      <div className="flex-1 pr-4">
        <h4 className="text-sm font-semibold text-text-primary">{item.name}</h4>
        <p className="text-xs text-text-secondary mt-0.5">{item.variant} • ₹{item.price}</p>
      </div>
      <div className="flex items-center gap-2 bg-surface-white border border-border-main rounded-lg overflow-hidden">
        <button onClick={() => item.quantity === 1 ? onRemove(item.cartId) : onUpdate(item.cartId, item.quantity - 1)} className="px-2.5 py-1 text-text-secondary hover:bg-surface-gray transition-colors font-bold">−</button>
        <span className="px-2 text-sm font-semibold text-text-primary min-w-[20px] text-center">{item.quantity}</span>
        <button onClick={() => onUpdate(item.cartId, item.quantity + 1)} className="px-2.5 py-1 text-text-secondary hover:bg-surface-gray transition-colors font-bold">+</button>
      </div>
    </div>
  );
};

export default CartItem;