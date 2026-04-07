// src/components/order/ProductCard.jsx
import React from 'react';

const ProductCard = ({ product, onAdd }) => {
  if (!product.isAvailable) return null;
  return (
    <div className="bg-surface-white border border-border-main rounded-xl p-3 hover:shadow-sm transition-shadow">
      <h3 className="text-sm font-bold text-text-primary leading-tight">{product.name}</h3>
      
      {/* Smaller pill label with low opacity grey */}
      <span className="inline-block mt-1 px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 rounded-full">
        {product.category}
      </span>
      
      {/* Original box style for variants */}
      <div className="grid grid-cols-2 gap-1.5 mt-2.5">
        {product.variants.map((v) => (
          <button
            key={v.name}
            onClick={() => onAdd(product, v.name, v.price)}
            className="flex flex-col items-center justify-center bg-surface-gray hover:bg-brand-pale border border-border-main hover:border-brand rounded-md py-2 px-1 transition-all text-center group"
          >
            <span className="text-[11px] font-semibold text-text-primary group-hover:text-brand transition-colors">{v.name}</span>
            <span className="text-[11px] font-bold text-text-secondary group-hover:text-brand transition-colors">₹{v.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;