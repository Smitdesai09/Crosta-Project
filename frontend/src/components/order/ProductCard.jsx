import React from 'react';

const ProductCard = ({ product, onAdd }) => {
  if (!product.isAvailable) return null;
  
  const gridCols = product.variants.length === 1 ? 'grid-cols-1' : 'grid-cols-2';

  return (
    <div className="bg-surface-gray border border-orange-100 rounded-xl p-3">
      {/* Top Row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-medium text-text-primary leading-tight">{product.name}</h3>
        
        <span className="flex-shrink-0 px-2 py-[2px] text-[9px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-200 rounded-full">
          {product.category}
        </span>
      </div>
      
      {/* Bottom Row - Hover effects live entirely on these buttons */}
      <div className={`grid ${gridCols} gap-1.5`}>
        {product.variants.map((v) => (
          <button
            key={v.name}
            onClick={() => onAdd(product, v.name, v.price)}
            className="flex items-center justify-between bg-surface-white hover:bg-brand-pale border border-border-main hover:border-brand rounded-lg py-2.5 px-3 transition-all group"
          >
            <span className="text-xs font-medium text-text-primary group-hover:text-brand transition-colors">{v.name}</span>
            <span className="text-xs font-semibold text-text-secondary group-hover:text-brand transition-colors">₹{v.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;