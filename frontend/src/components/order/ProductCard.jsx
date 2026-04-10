import React from 'react';

const ProductCard = ({ product, onAdd }) => {
  if (!product.isAvailable) return null;

  const gridCols = product.variants.length === 1 ? 'grid-cols-1' : 'grid-cols-2';

  return (
    <div className="bg-white border border-gray-300 rounded-xl p-3.5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug">{product.name}</h3>
        <span className="flex-shrink-0 px-2 py-[2px] text-[9px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-500 rounded-md">
          {product.category}
        </span>
      </div>

      <div className={`grid ${gridCols} gap-2`}>
        {product.variants.map((v) => (
          <button
            key={v.name}
            onClick={() => onAdd(product, v.name, v.price)}
            className="flex items-center justify-between bg-gray-50 hover:bg-[#FFF5E9] border border-gray-200 hover:border-[#FF7A00] rounded-lg py-2.5 px-3 transition-all group"
          >
            <span className="text-xs font-medium text-gray-800 group-hover:text-[#FF7A00] transition-colors">{v.name}</span>
            <span className="text-xs font-bold text-gray-900 group-hover:text-[#FF7A00] transition-colors">₹{v.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;