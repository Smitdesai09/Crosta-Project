import React, { useState, useMemo, useEffect } from 'react';
import TableCard from '../components/order/TableCard';
import ProductCard from '../components/order/ProductCard';
import CartItem from '../components/order/CartItem';
import OrderTypeCard from '../components/order/OrderTypeCard';
import BillModal from '../components/order/BillModal';
import orderService from '../services/orderService';
import { useToast } from '../context/ToastContext';

const Orders = () => {
  const { showToast } = useToast();

  const [view, setView] = useState('tables');
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderType, setOrderType] = useState('Dine-in');
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        orderService.getActiveOrders(),
        orderService.getProducts()
      ]);

      const activeOrders = ordersRes.data.data;
      const activeProducts = productsRes.data.data;

      const activeMap = {};
      activeOrders.forEach(order => {
        activeMap[order.tableNumber] = order;
      });

      const mappedTables = Array.from({ length: 6 }, (_, i) => {
        const tableNum = i + 1;
        const activeOrder = activeMap[tableNum];
        if (activeOrder) {
          return { id: tableNum, status: 'Occupied', orderId: activeOrder._id, subtotal: activeOrder.subtotal };
        }
        return { id: tableNum, status: 'Available' };
      });

      setTables(mappedTables);
      setProducts(activeProducts);
    } catch (error) {
      showToast("Failed to load initial data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return ['All', ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory && p.isAvailable;
    });
  }, [searchTerm, activeCategory, products]);

  const handleAddToCart = (product, variantName, variantPrice) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item._id === product._id && item.variant === variantName);
      if (existingIndex !== -1) {
        return prev.map((item, index) => index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { cartId: Date.now() + Math.random(), _id: product._id, name: product.name, variant: variantName, price: variantPrice, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (cartId, newQty) => setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, quantity: newQty } : item));
  const handleRemoveItem = (cartId) => setCart(prev => prev.filter(item => item.cartId !== cartId));

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const isCartEmpty = cart.length === 0;

  const handleSelectTable = async (tableId) => {
    setSelectedTable(tableId);
    setView('cart');
    const table = tables.find(t => t.id === tableId);

    if (table.status === 'Occupied') {
      try {
        const res = await orderService.getOrderById(table.orderId);
        const orderData = res.data.data;
        setOrderId(orderData._id);
        setOrderType(orderData.orderType === 'dine-in' ? 'Dine-in' : 'Takeaway');
        const mappedCart = orderData.items.map(item => ({ cartId: Date.now() + Math.random(), _id: item.productId, name: item.name, variant: item.variant, price: item.price, quantity: item.quantity }));
        setCart(mappedCart);
      } catch (error) {
        showToast(error.response?.data?.message || "Failed to fetch order", "error");
        resetToTables();
      }
    } else {
      setOrderId(null);
      setCart([]);
      setOrderType('Dine-in');
    }
  };

  // --- CENTRAL RESET FUNCTION ---
  const resetToTables = () => {
    setView('tables');
    setSelectedTable(null);
    setCart([]);
    setOrderId(null);
  };

  // --- PRINT KOT LOGIC ---
  const printKOT = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Please allow popups to print", "error");
      return;
    }

    const itemsHtml = cart.map(item => `
      <tr>
        <td style="border-bottom: 1px dashed #ccc; padding: 6px 0;">${item.quantity}x</td>
        <td style="border-bottom: 1px dashed #ccc; padding: 6px 10px; font-weight: 500;">${item.name}</td>
        <td style="border-bottom: 1px dashed #ccc; padding: 6px 0; text-align: right; color: #555;">${item.variant}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>KOT - Table ${selectedTable}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; padding: 20px; color: #000; }
            h2 { text-align: center; margin-bottom: 5px; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; }
            .meta { text-align: center; font-size: 12px; margin-bottom: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            .timestamp { text-align: center; margin-top: 30px; font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <h2>Kitchen Order Ticket</h2>
          <div class="meta">
            <strong>Table ${selectedTable}</strong> | ${orderType}<br>
            ${orderId ? `ID: ORD_${orderId.slice(-5)}` : 'NEW ORDER'}
          </div>
          <table>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div class="timestamp">Printed: ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // --- SAVE KOT ---
  const handleSaveKOT = async (shouldPrint = false) => {
    if (isCartEmpty) return;

    const payload = {
      tableNumber: selectedTable,
      orderType: orderType === 'Dine-in' ? 'dine-in' : 'takeaway',
      items: cart.map(item => ({ productId: item._id, variant: item.variant, quantity: item.quantity }))
    };

    try {
      let res;
      if (orderId) {
        res = await orderService.updateOrder(orderId, payload);
      } else {
        res = await orderService.createOrder(payload);
        setOrderId(res.data.data._id);
      }

      if (shouldPrint) {
        printKOT();
        // Wait briefly for print dialog to process, then go back
        setTimeout(() => {
          fetchInitialData();
          resetToTables();
        }, 500);
      } else {
        showToast("KOT Saved successfully!", "success");
        fetchInitialData();
        resetToTables();
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to save KOT", "error");
    }
  };

  // --- CANCEL ORDER ---
  const handleCancelOrder = async () => {
    if (orderId) {
      try {
        await orderService.cancelOrder(orderId);
        showToast("Order cancelled", "success");
      } catch (error) {
        showToast(error.response?.data?.message || "Failed to cancel order", "error");
        return;
      }
    }
    fetchInitialData();
    resetToTables();
  };

  // --- GENERATE BILL ---
  // --- GENERATE BILL ---
  const handleGenerateBill = async (discount, paymentType, customerPhone, shouldPrint = false) => {
    if (!orderId) {
      showToast("Please save the KOT before billing", "error");
      return;
    }

    try {
      const res = await orderService.createBill({
        orderId,
        discount: Number(discount),
        paymentType: paymentType.toLowerCase(),
        customerPhone: customerPhone || null  // <-- ADDED BACK
      });

      showToast("Bill generated successfully!", "success");
      setIsBillModalOpen(false);

      if (shouldPrint) {
        generateReceipt(res.data.data, true);
      }

      if (shouldPrint) {
        setTimeout(() => {
          fetchInitialData();
          resetToTables();
        }, 500);
      } else {
        fetchInitialData();
        resetToTables();
      }

    } catch (error) {
      console.log("Bill Error:", error?.response?.data?.message);
      showToast(error?.response?.data?.message || "Failed to generate bill", "error");
    }
  };

  // --- SHARED RECEIPT GENERATOR (Print Only) ---
  const generateReceipt = (billData, shouldPrint) => {
    if (!shouldPrint) return; // Early exit if not printing

    const itemsHtml = billData.items.map(item => `
      <tr>
        <td style="padding: 4px 0; font-size: 12px;">${item.quantity}x ${item.name} (${item.variant})</td>
        <td style="padding: 4px 0; text-align: right; font-size: 12px;">₹${item.subtotal.toFixed(2)}</td>
      </tr>
    `).join('');

    const fullReceiptHtml = `
      <html>
        <head>
          <title>Bill - Table ${billData.tableNumber}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; padding: 20px; color: #000; }
            h2 { text-align: center; margin-bottom: 0; font-size: 20px; text-transform: uppercase; }
            .sub { text-align: center; font-size: 12px; color: #555; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { text-align: left; font-size: 12px; border-bottom: 1px solid #000; padding-bottom: 4px; }
            .totals { width: 100%; font-size: 12px; }
            .totals tr td:last-child { text-align: right; }
            .final-total { font-size: 16px; font-weight: bold; border-top: 2px solid #000; margin-top: 10px; }
            .final-total td { padding-top: 8px !important; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <h2>CROSTA PIZZA</h2>
          <div class="sub">Table ${billData.tableNumber} | ${billData.orderType.toUpperCase()}</div>
          
          <table><thead><tr><th>Item</th><th style="text-align:right;">Amount</th></tr></thead>
          <tbody>${itemsHtml}</tbody></table>

          <table class="totals">
            <tr><td>Subtotal</td><td>₹${billData.subtotal.toFixed(2)}</td></tr>
            ${billData.discount > 0 ? `<tr><td>Discount</td><td>- ₹${billData.discount.toFixed(2)}</td></tr>` : ''}
            <tr><td>GST</td><td>+ ₹${billData.gst.toFixed(2)}</td></tr>
            <tr class="final-total"><td>TOTAL</td><td>₹${billData.totalAmount.toFixed(2)}</td></tr>
          </table>

          <div class="footer">
            Payment: ${billData.paymentType.toUpperCase()}<br>
            Printed: ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Please allow popups to print", "error");
      return;
    }
    printWindow.document.write(fullReceiptHtml);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  if (isLoading && view === 'tables') {
    return (
      <div className="h-[calc(100vh-3.5rem)] w-full bg-surface-gray flex items-center justify-center">
        <span className="animate-pulse text-text-secondary font-medium">Loading tables...</span>
      </div>
    );
  }

  return (
    // Changed h-[calc(100vh-3.5rem)] to h-full
    <div className="h-full w-full bg-surface-gray flex flex-col overflow-hidden">
      {view === 'tables' ? (
        // ... rest remains exactly the same
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
            {tables.map(table => <TableCard key={table.id} table={table} onClick={handleSelectTable} />)}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-2 px-2 pb-0.5 pt-0 min-h-0 min-w-0">
          {/* LEFT: Products Panel */}
          <div className="flex-1 flex flex-col bg-surface-white rounded-xl border border-border-main shadow-sm min-h-0 min-w-0 overflow-hidden">
            <div className="px-3 pt-3 pb-2 border-b border-border-main flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={resetToTables} className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-gray border border-border-main text-text-secondary hover:bg-gray-100 hover:border-gray-400 hover:text-text-primary transition-all text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
                <div className="flex-1 min-w-0 relative">
                  <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 pr-9 bg-surface-gray border border-border-main rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border flex-shrink-0 ${activeCategory === cat ? 'bg-brand-pale border-brand text-brand' : 'bg-surface-white border-border-main text-text-secondary hover:bg-gray-100'}`}>{cat}</button>
                ))}
              </div>
            </div>
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
            <div className="px-3 pt-3 pb-2 border-b border-border-main flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-text-primary">Table {selectedTable}</h2>
                <button onClick={handleCancelOrder} className="text-xs font-semibold text-red-500 hover:text-red-700">{orderId ? 'Cancel Order' : 'Clear Order'}</button>
              </div>
              <div className="flex gap-2">
                <OrderTypeCard type="Dine-in" isActive={orderType === 'Dine-in'} onClick={() => setOrderType('Dine-in')} />
                <OrderTypeCard type="Takeaway" isActive={orderType === 'Takeaway'} onClick={() => setOrderType('Takeaway')} />
              </div>
            </div>

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

            <div className="px-3 pt-3 pb-0.5 border-t border-border-main flex-shrink-0">
              <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-medium text-text-secondary">Subtotal</span>
                <span className="text-xl font-bold text-text-primary">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  {/* Notice: passing false/true here for print */}
                  <button disabled={isCartEmpty} onClick={() => handleSaveKOT(false)} className="flex-1 py-1.5 border border-border-main text-text-secondary hover:bg-surface-gray disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors">Save KOT</button>
                  <button disabled={isCartEmpty} onClick={() => handleSaveKOT(true)} className="flex-1 py-1.5 border border-border-main text-text-primary hover:bg-surface-gray disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors">Save & Print KOT</button>
                </div>
                <button onClick={() => setIsBillModalOpen(true)} disabled={isCartEmpty || !orderId} className="w-full py-2.5 bg-brand hover:bg-brand-hover disabled:bg-gray-300 text-surface-white rounded-lg text-sm font-bold shadow-sm transition-colors disabled:cursor-not-allowed">
                  Proceed to Bill
                </button>
              </div>
            </div>
          </div>

          <BillModal
            isOpen={isBillModalOpen}
            onClose={() => setIsBillModalOpen(false)}
            cart={cart}
            onGenerateBill={handleGenerateBill}
          />
        </div>
      )}
    </div>
  );
};

export default Orders;