import React from 'react';

const ProductCard = ({ product, onAdd }) => {
  if (!product.isAvailable) return null;

  const gridCols = product.variants.length === 1 ? 'grid-cols-1' : 'grid-cols-2';

  return (
    <div className="bg-white border border-black rounded-xl p-5">
      <div className="flex items-start justify-between gap-2 mb-4">
        <h3 className="text-[15px] font-semibold text-black leading-snug">{product.name}</h3>
        <span className="flex-shrink-0 px-2 py-[2px] text-[9px] font-semibold uppercase tracking-wider bg-black/5 text-black/60 border border-gray-400 rounded-md">
          {product.category}
        </span>
      </div>

      <div className={`grid ${gridCols} gap-2.5`}>
        {product.variants.map((v) => (
          <button
            key={v.name}
            onClick={() => onAdd(product, v.name, v.price)}
            className="flex items-center justify-between bg-black/5 hover:bg-[#FFF5E9] border border-black/15 hover:border-[#FF7A00] rounded-lg py-3 px-4 transition-all group"
          >
            <span className="text-sm font-medium text-black/80 group-hover:text-[#FF7A00] transition-colors">{v.name}</span>
            <span className="text-sm font-bold text-black group-hover:text-[#FF7A00] transition-colors">₹{v.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;