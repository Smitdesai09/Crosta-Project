import React from 'react';

const ProductCard = ({ product, onAdd }) => {
  if (!product.isAvailable) return null;

  const gridCols = product.variants.length === 1 ? 'grid-cols-1' : 'grid-cols-2';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-4">
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug">{product.name}</h3>
        <span className="flex-shrink-0 px-2 py-[2px] text-[9px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-md">
          {product.category}
        </span>
      </div>

      <div className={`grid ${gridCols} gap-2.5`}>
        {product.variants.map((v) => (
          <button
            key={v.name}
            onClick={() => onAdd(product, v.name, v.price)}
            className="flex items-center justify-between bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-500/30 rounded-lg py-3 px-4 transition-colors group"
          >
            <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">{v.name}</span>
            <span className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">₹{v.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;