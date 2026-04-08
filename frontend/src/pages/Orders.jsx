import React, { useState, useMemo } from 'react';
import TableCard from '../components/order/TableCard';
import ProductCard from '../components/order/ProductCard';
import CartItem from '../components/order/CartItem';
import OrderTypeCard from '../components/order/OrderTypeCard';
import BillModal from '../components/order/BillModal';

const tables = [
  { id: 1, status: 'Available' },
  { id: 2, status: 'Occupied', orderId: '#ORD-204', subtotal: 1258.00 },
  { id: 3, status: 'Available' },
  { id: 4, status: 'Occupied', orderId: '#ORD-198', subtotal: 549.00 },
  { id: 5, status: 'Available' },
  { id: 6, status: 'Available' },
];

const products = [
  { _id: "1", name: "All Veggies", category: "MARINARA SAUCE", variants: [{ name: "Small", price: 249 }, { name: "Large", price: 539 }], isAvailable: true },
  { _id: "2", name: "Tyscan Garden", category: "PESTO SAUCE", variants: [{ name: "Large", price: 569 }], isAvailable: true },
  { _id: "3", name: "Mushroom Delight", category: "MARINARA SAUCE", variants: [{ name: "Small", price: 269 }, { name: "Large", price: 549 }], isAvailable: true },
  { _id: "4", name: "Garlic Bread", category: "FRESH BREAD", variants: [{ name: "Regular", price: 249 }], isAvailable: true },
  { _id: "5", name: "Salted", category: "FRIES", variants: [{ name: "Regular", price: 119 }, { name: "Cheesy", price: 149 }], isAvailable: true },
  { _id: "6", name: "Peri-Peri", category: "FRIES", variants: [{ name: "Regular", price: 139 }, { name: "Cheesy", price: 189 }], isAvailable: true },
  { _id: "7", name: "Margherita", category: "MARINARA SAUCE", variants: [{ name: "Small", price: 229 }, { name: "Large", price: 469 }], isAvailable: true },
  { _id: "8", name: "Brocco Cheese", category: "ALFREDO SAUCE", variants: [{ name: "Small", price: 249 }, { name: "Large", price: 529 }], isAvailable: true },
  { _id: "9", name: "Peppered Olive Volcano", category: "CALZONE", variants: [{ name: "Regular", price: 449 }], isAvailable: true },
  { _id: "10", name: "Marinara", category: "MARINARA SAUCE", variants: [{ name: "Small", price: 199 }, { name: "Large", price: 409 }], isAvailable: true },
  { _id: "11", name: "Pesto Pasta", category: "PENNE PASTA", variants: [{ name: "Regular", price: 319 }], isAvailable: true },
  { _id: "12", name: "Alfredo Pasta", category: "PENNE PASTA", variants: [{ name: "Regular", price: 269 }], isAvailable: true },
  { _id: "13", name: "Paneer Parmesan", category: "MARINARA SAUCE", variants: [{ name: "Small", price: 269 }, { name: "Large", price: 549 }], isAvailable: true },
  { _id: "14", name: "Stuffed Garlic Bread", category: "FRESH BREAD", variants: [{ name: "Regular", price: 279 }], isAvailable: true },
  { _id: "15", name: "Marinara Pasta", category: "PENNE PASTA", variants: [{ name: "Regular", price: 289 }], isAvailable: true },
  { _id: "16", name: "Avocado Toast", category: "SOURDOUGH SANDWICH", variants: [{ name: "Regular", price: 249 }], isAvailable: true },
  { _id: "17", name: "Pink Sauce Pasta", category: "PENNE PASTA", variants: [{ name: "Regular", price: 299 }], isAvailable: true },
  { _id: "18", name: "Four Pepper Garlic Bread", category: "FRESH BREAD", variants: [{ name: "Regular", price: 299 }], isAvailable: true },
  { _id: "19", name: "All Veggies", category: "SOURDOUGH SANDWICH", variants: [{ name: "Regular", price: 279 }], isAvailable: true },
  { _id: "20", name: "Cheesy Mushroom", category: "SOURDOUGH SANDWICH", variants: [{ name: "Regular", price: 299 }], isAvailable: true },
  { _id: "21", name: "Umami Sunset", category: "ALFREDO SAUCE", variants: [{ name: "Small", price: 269 }, { name: "Large", price: 529 }], isAvailable: true },
  { _id: "22", name: "Quad-Cheese", category: "PESTO SAUCE", variants: [{ name: "Small", price: 269 }, { name: "Large", price: 559 }], isAvailable: true },
  { _id: "23", name: "Caprese", category: "SOURDOUGH SANDWICH", variants: [{ name: "Regular", price: 269 }], isAvailable: true }
];

const Orders = () => {
  const [view, setView] = useState('tables');
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderType, setOrderType] = useState('Dine-in');
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return ['All', ...cats];
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory && p.isAvailable;
    });
  }, [searchTerm, activeCategory]);

  const handleAddToCart = (product, variantName, variantPrice) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item._id === product._id && item.variant === variantName);

      if (existingIndex !== -1) {
        // Use map to create a brand new object, avoiding direct mutation
        return prev.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, {
        cartId: Date.now() + Math.random(),
        _id: product._id,
        name: product.name,
        variant: variantName,
        price: variantPrice,
        quantity: 1
      }];
    });
  };

  const handleUpdateQuantity = (cartId, newQty) => setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, quantity: newQty } : item));
  const handleRemoveItem = (cartId) => setCart(prev => prev.filter(item => item.cartId !== cartId));

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const isCartEmpty = cart.length === 0;

  const handleSelectTable = (tableId) => {
    setSelectedTable(tableId);
    if (selectedTable !== tableId) {
      setCart([]);
      setOrderType('Dine-in');
    }
    setView('cart');
  };

  const handleGoBack = () => setView('tables');

  const handleCancelOrder = () => {
    setView('tables');
    setSelectedTable(null);
    setCart([]);
  };

  const handlePlaceholder = (type) => {
    alert(`${type === 'save' ? 'Save' : 'Save & Print'} API call will go here.`);
    setIsBillModalOpen(false);
    handleCancelOrder();
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full bg-surface-gray flex flex-col overflow-hidden">
      {view === 'tables' ? (
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
            {tables.map(table => <TableCard key={table.id} table={table} onClick={handleSelectTable} />)}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-2 px-2 pb-0.5 pt-0 min-h-0 min-w-0">

          {/* LEFT: Products Panel */}
          <div className="flex-1 flex flex-col bg-surface-white rounded-xl border border-border-main shadow-sm min-h-0 min-w-0 overflow-hidden">
            {/* Fixed Header */}
            <div className="px-3 pt-3 pb-2 border-b border-border-main flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={handleGoBack}
                  className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-gray border border-border-main text-text-secondary hover:bg-gray-100 hover:border-gray-400 hover:text-text-primary transition-all text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>

                <div className="flex-1 min-w-0 relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 pr-9 bg-surface-gray border border-border-main rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border flex-shrink-0 ${activeCategory === cat ? 'bg-brand-pale border-brand text-brand' : 'bg-surface-white border-border-main text-text-secondary hover:bg-gray-100'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Products Area - NOW PURE WHITE */}
            <div className="flex-1 overflow-y-auto p-3 min-h-0 bg-surface-white">
              <div className="grid grid-cols-2 gap-2.5">
                {filteredProducts.length > 0 ? filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} onAdd={handleAddToCart} />
                )) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-10 text-text-secondary">
                    <p className="text-lg font-medium">No products found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Cart Panel */}
          <div className="w-96 flex-shrink-0 bg-surface-white rounded-xl border border-border-main flex flex-col shadow-sm min-h-0">
            {/* Header */}
            <div className="px-3 pt-3 pb-2 border-b border-border-main flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-text-primary">Table {selectedTable}</h2>
                <button onClick={handleCancelOrder} className="text-xs font-semibold text-red-500 hover:text-red-700">Clear Order</button>
              </div>
              <div className="flex gap-2">
                <OrderTypeCard type="Dine-in" isActive={orderType === 'Dine-in'} onClick={() => setOrderType('Dine-in')} />
                <OrderTypeCard type="Takeaway" isActive={orderType === 'Takeaway'} onClick={() => setOrderType('Takeaway')} />
              </div>
            </div>

            {/* Cart Items - NOW SCROLLABLE */}
            {/* Cart Items - LIMITED TO 7 ITEMS */}
            <div className="flex-1 overflow-y-auto min-h-0 max-h-[28.5rem] px-3 py-1.5 divide-y divide-border-main">
              {cart.length > 0 ? cart.map(item => (
                <CartItem key={item.cartId} item={item} onUpdate={handleUpdateQuantity} onRemove={handleRemoveItem} />
              )) : (
                <div className="flex flex-col items-center justify-center py-4 text-text-secondary text-sm">
                  <p>Cart is empty</p>
                  <p className="text-xs mt-1">Click a variant to add</p>
                </div>
              )}
            </div>

            {/* Footer - ALWAYS VISIBLE */}
            <div className="px-3 pt-3 pb-0.5 border-t border-border-main flex-shrink-0">
              <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-medium text-text-secondary">Subtotal</span>
                <span className="text-xl font-bold text-text-primary">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <button disabled={isCartEmpty} onClick={() => alert('Save KOT API placeholder')} className="flex-1 py-1.5 border border-border-main text-text-secondary hover:bg-surface-gray disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors">Save KOT</button>
                  <button disabled={isCartEmpty} onClick={() => alert('Save & Print KOT API placeholder')} className="flex-1 py-1.5 border border-border-main text-text-primary hover:bg-surface-gray disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors">Save & Print KOT</button>
                </div>
                <button onClick={() => setIsBillModalOpen(true)} disabled={isCartEmpty} className="w-full py-2.5 bg-brand hover:bg-brand-hover disabled:bg-gray-300 text-surface-white rounded-lg text-sm font-bold shadow-sm transition-colors disabled:cursor-not-allowed">
                  Proceed to Bill
                </button>
              </div>
            </div>
          </div>

          <BillModal isOpen={isBillModalOpen} onClose={() => setIsBillModalOpen(false)} cart={cart} onSavePlaceholder={handlePlaceholder} />
        </div>
      )}
    </div>
  );
};

export default Orders;