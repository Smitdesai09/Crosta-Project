/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import TableCard from '../components/order/TableCard';
import ProductCard from '../components/order/ProductCard';
import CartItem from '../components/order/CartItem';
import BillModal from '../components/order/BillModal';
import TakeawayOrderCard from '../components/order/TakeawayOrderCard';
import orderService from '../services/orderService';
import billService from '../services/billService';
import { useToast } from '../lib/ToastContext';

const API_BASE = import.meta.env.VITE_API_URL;

const formatType = (type) => {
  if (type === 'dine-in') return 'Dine-in';
  if (type === 'takeaway') return 'Takeaway';
  return type;
};

const Orders = () => {
  const { showToast } = useToast();

  const [view, setView] = useState('tables');
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [displayOrderId, setDisplayOrderId] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const [tables, setTables] = useState([]);
  const [takeawayOrders, setTakeawayOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const [currentTimeState, setCurrentTimeState] = useState(currentTime);
  const [isCartDirty, setIsCartDirty] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [isSavingForBill, setIsSavingForBill] = useState(false);

  const currentOrderType = selectedTable ? 'dine-in' : 'takeaway';

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        orderService.getActiveOrders(),
        orderService.getProducts()
      ]);

      const activeOrders = ordersRes.data.data;
      const activeProducts = productsRes.data.data;

      const activeDineInOrders = activeOrders.filter(o => o.orderType === 'dine-in');
      const activeTakeawayOrders = activeOrders.filter(o => o.orderType === 'takeaway');

      const dineInMap = {};
      activeDineInOrders.forEach(order => {
        dineInMap[order.tableNumber] = order;
      });

      const mappedTables = Array.from({ length: 6 }, (_, i) => {
        const tableNum = i + 1;
        const activeOrder = dineInMap[tableNum];
        if (activeOrder) {
          return {
            id: tableNum,
            status: 'Occupied',
            orderId: activeOrder._id,
            displayOrderId: activeOrder.orderId,
            subtotal: activeOrder.subtotal,
            createdAt: activeOrder.createdAt
          };
        }
        return { id: tableNum, status: 'Available' };
      });

      setTables(mappedTables);
      setTakeawayOrders(activeTakeawayOrders);
      setProducts(activeProducts);
    } catch (error) {
      showToast("Failed to load initial data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const ordersRes = await orderService.getActiveOrders();
      const activeOrders = ordersRes.data.data;

      const activeDineInOrders = activeOrders.filter(o => o.orderType === 'dine-in');
      const activeTakeawayOrders = activeOrders.filter(o => o.orderType === 'takeaway');

      const dineInMap = {};
      activeDineInOrders.forEach(order => {
        dineInMap[order.tableNumber] = order;
      });

      const mappedTables = Array.from({ length: 6 }, (_, i) => {
        const tableNum = i + 1;
        const activeOrder = dineInMap[tableNum];
        if (activeOrder) {
          return {
            id: tableNum,
            status: 'Occupied',
            orderId: activeOrder._id,
            displayOrderId: activeOrder.orderId,
            subtotal: activeOrder.subtotal,
            createdAt: activeOrder.createdAt
          };
        }
        return { id: tableNum, status: 'Available' };
      });

      setTables(mappedTables);
      setTakeawayOrders(activeTakeawayOrders);
    } catch (error) {
      showToast("Failed to refresh tables", "error");
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
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
    setIsCartDirty(true);
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item._id === product._id && item.variant === variantName);
      if (existingIndex !== -1) {
        return prev.map((item, index) => index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { cartId: Date.now() + Math.random(), _id: product._id, name: product.name, variant: variantName, price: variantPrice, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (cartId, newQty) => {
    setIsCartDirty(true);
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveItem = (cartId) => {
    setIsCartDirty(true);
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

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
        setDisplayOrderId(orderData.orderId);
        const mappedCart = orderData.items.map(item => ({ cartId: Date.now() + Math.random(), _id: item.productId, name: item.name, variant: item.variant, price: item.price, quantity: item.quantity }));
        setCart(mappedCart);
        setIsCartDirty(false);
      } catch (error) {
        showToast(error.response?.data?.message || "Failed to fetch order", "error");
        resetToTables();
      }
    } else {
      setOrderId(null);
      setDisplayOrderId(null);
      setCart([]);
      setIsCartDirty(false);
    }
  };

  const handleNewTakeaway = () => {
    setSelectedTable(null);
    setOrderId(null);
    setDisplayOrderId(null);
    setCart([]);
    setIsCartDirty(false);
    setView('cart');
  };

  const handleSelectTakeawayOrder = async (takeawayOrder) => {
    setSelectedTable(null);
    setView('cart');

    try {
      const res = await orderService.getOrderById(takeawayOrder._id);
      const orderData = res.data.data;
      setOrderId(orderData._id);
      setDisplayOrderId(orderData.orderId);
      const mappedCart = orderData.items.map(item => ({ cartId: Date.now() + Math.random(), _id: item.productId, name: item.name, variant: item.variant, price: item.price, quantity: item.quantity }));
      setCart(mappedCart);
      setIsCartDirty(false);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to fetch order", "error");
      resetToTables();
    }
  };

  const resetToTables = () => {
    setView('tables');
    setSelectedTable(null);
    setCart([]);
    setOrderId(null);
    setDisplayOrderId(null);
  };

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
          <title>KOT - ${displayOrderId || 'New Order'}</title>
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
            <strong>${formatType(currentOrderType)}</strong> | ${displayOrderId || 'NEW ORDER'}
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
      setTimeout(() => {
        printWindow.close();
      }, 100);
    };
  };

  const buildPayload = () => {
    const payload = {
      orderType: currentOrderType,
      items: cart.map(item => ({ productId: item._id, variant: item.variant, quantity: item.quantity }))
    };

    if (selectedTable) {
      payload.tableNumber = selectedTable;
    }

    return payload;
  };

  const handleSaveKOT = async (shouldPrint = false) => {
    if (isCartEmpty) return;

    const payload = buildPayload();

    try {
      let res;
      if (orderId) {
        res = await orderService.updateOrder(orderId, payload);
      } else {
        res = await orderService.createOrder(payload);
        setOrderId(res.data.data._id);
        setDisplayOrderId(res.data.data.orderId);
      }

      setIsCartDirty(false);

      if (shouldPrint) {
        printKOT();
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

  const handleOpenBillModal = async () => {
    if (isCartEmpty || isSavingForBill) return;

    if (isCartDirty || !orderId) {
      setIsSavingForBill(true);
      try {
        const payload = buildPayload();

        if (orderId) {
          await orderService.updateOrder(orderId, payload);
        } else {
          const res = await orderService.createOrder(payload);
          setOrderId(res.data.data._id);
          setDisplayOrderId(res.data.data.orderId);
        }

        setIsCartDirty(false);
        fetchTables();
        showToast("KOT Saved!", "success");

      } catch (error) {
        showToast(error.response?.data?.message || "Failed to save KOT before billing", "error");
        return;
      } finally {
        setIsSavingForBill(false);
      }
    }

    setIsBillModalOpen(true);
  };

  const triggerDesktopApp = (phone, billId) => {
    const pdfLink = `${API_BASE}/api/bills/pdf/download/${billId}`;
    const message = `Hello! Your bill is ready.\n\nDownload your PDF invoice:\n${pdfLink}\n\nThank you, visit again!`;
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `whatsapp://send?phone=91${phone}&text=${encodedMessage}`;

    const link = document.createElement('a');
    link.href = waUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      window.focus();
    }, 100);
  };

  const handleGenerateBill = async (discount, paymentType, customerPhone, shouldPrint = false, sendEBill = false) => {
    if (isBillingLoading) return;
    setIsBillingLoading(true);

    if (!orderId) {
      showToast("Please save the KOT before billing", "error");
      setIsBillingLoading(false);
      return;
    }

    try {
      const res = await billService.createBill({
        orderId,
        discount: Number(discount),
        paymentType: paymentType.toLowerCase(),
        customerPhone: customerPhone || null
      });

      const billData = res.data.data;

      setIsBillModalOpen(false);

      if (shouldPrint) {
        generateReceipt(billData);
      }

      if (shouldPrint) {
        await new Promise(resolve => setTimeout(resolve, 2500));
      }

      if (sendEBill) {
        triggerDesktopApp(customerPhone, billData._id);
      }

      const toastMsg = sendEBill ? "Bill Generated, WhatsApp opened" : "Bill Generated";
      showToast(toastMsg, "success");

      fetchInitialData();
      resetToTables();

    } catch (error) {
      console.error("Bill Error:", error?.response?.data?.message);
      showToast(error?.response?.data?.message || "Failed to generate bill", "error");
    } finally {
      setIsBillingLoading(false);
    }
  };

  const generateReceipt = (billData) => {
    const dateObj = new Date(billData.createdAt);
    const minimalDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: '2-digit' });
    const minimalTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateTimeStr = `${minimalDate} ${minimalTime}`;

    const itemsHtml = billData.items.map(item => `
      <tr>
        <td style="padding: 4px 0; font-size: 12px;">${item.quantity}x ${item.name} (${item.variant})</td>
        <td style="padding: 4px 0; text-align: right; font-size: 12px;">₹${item.subtotal.toFixed(2)}</td>
      </tr>
    `).join('');

    const fullReceiptHtml = `
      <html>
        <head>
          <title>Bill</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; padding: 20px; color: #000; }
            h2 { text-align: center; margin: 0 0 2px 0; font-size: 20px; text-transform: uppercase; }
            .gstin { text-align: center; font-size: 10px; color: #555; margin-bottom: 15px; }
            .meta { text-align: center; font-size: 11px; color: #000; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th { text-align: left; font-size: 12px; border-bottom: 1px solid #000; padding-bottom: 4px; }
            .totals { width: 100%; font-size: 12px; }
            .totals tr td:last-child { text-align: right; }
            .final-total { font-size: 16px; font-weight: bold; border-top: 2px solid #000; }
            .footer { margin-top: 25px; }
            .payment { font-size: 11px; color: #000; margin-bottom: 15px; }
            .thanks { text-align: center; font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <h2>Crosta by PD²</h2>
          <div class="gstin">GSTIN: 24CPUPD4122D1Z8</div>
          <div class="meta">${dateTimeStr} | ${formatType(billData.orderType)}</div>
          
          <table>
            <thead><tr><th>Item</th><th style="text-align:right;">Amount</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <table class="totals">
            <tr><td>Subtotal</td><td>₹${billData.subtotal.toFixed(2)}</td></tr>
            ${billData.discount > 0 ? `<tr><td>Discount</td><td>- ₹${billData.discount.toFixed(2)}</td></tr>` : ''}
            <tr><td>GST</td><td>+ ₹${billData.gst.toFixed(2)}</td></tr>
            <tr class="final-total"><td>TOTAL</td><td>₹${billData.totalAmount.toFixed(2)}</td></tr>
          </table>

          <div class="footer">
            <div class="payment">Payment: ${billData.paymentType.toUpperCase()}</div>
            <div class="thanks">Thank You, Visit Again</div>
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
      setTimeout(() => {
        printWindow.close();
      }, 100);
    };
  };

  if (isLoading && view === 'tables') {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="animate-pulse text-gray-400 font-medium">Loading tables...</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col gap-4 overflow-hidden">

      {view !== 'tables' && (
        <div className="flex items-end justify-between flex-shrink-0 px-4 lg:px-6">
          <h1 className="text-3xl font-extrabold italic tracking-tight text-gray-900">Orders</h1>
        </div>
      )}

      {view === 'tables' ? (
        <div className="p-6 h-full flex flex-col">

          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-6 flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extrabold italic tracking-tight text-gray-900">Orders</h1>
              <div className="h-6 w-px bg-gray-200"></div>
              <span className="text-sm font-medium text-gray-400">
                {tables.filter(t => t.status === 'Occupied').length}/6 Tables Active
              </span>
            </div>
            <div className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
              {currentTimeState}
            </div>
          </div>

          <div className="flex gap-0 flex-1 min-h-0">

            <div className="flex-1 grid grid-cols-2 gap-4 content-start pr-6">
              {tables.map(table => (
                <TableCard key={table.id} table={table} onClick={handleSelectTable} />
              ))}
            </div>

            <div className="w-px bg-gray-200 flex-shrink-0 my-1"></div>

            <div className="flex-1 flex flex-col min-h-0 min-w-0 pl-6">
              <div
                onClick={handleNewTakeaway}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-white border border-dashed border-gray-300 hover:border-gray-500 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm group flex-shrink-0"
              >
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs font-medium text-gray-400 group-hover:text-gray-700 transition-colors">New Takeaway</span>
              </div>

              <div className="mt-3 flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
                {takeawayOrders.length > 0 ? takeawayOrders.map(order => (
                  <TakeawayOrderCard
                    key={order._id}
                    order={order}
                    onClick={handleSelectTakeawayOrder}
                  />
                )) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                    <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-xs font-medium">No active takeaway orders</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-2 px-2 pb-2 pt-0 min-h-0 min-w-0">

          <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm min-h-0 min-w-0 overflow-hidden">
            <div className="px-3 pt-3 pb-2 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={resetToTables} className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
                <div className="flex-1 min-w-0 relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-3 py-2 pr-9 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors ${searchTerm ? 'border-red-500/30 bg-red-50 font-medium' : 'border-gray-300'}`}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border flex-shrink-0 ${activeCategory === cat ? 'bg-red-50 border-red-500 text-red-500' : 'bg-white border-gray-300 text-gray-500 hover:bg-red-50 hover:border-red-500 hover:text-red-500'}`}>{cat}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 min-h-0 bg-white">
              <div className="grid grid-cols-2 gap-2.5">
                {filteredProducts.length > 0 ? filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} onAdd={handleAddToCart} />
                )) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-400">
                    <p className="text-lg font-medium text-gray-900">No products found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-96 flex-shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col shadow-sm min-h-0">
            <div className="bg-red-500 px-3 py-2.5 rounded-t-xl flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                <span>{formatType(currentOrderType)}</span>
                <span className="text-red-200">|</span>
                <span>{displayOrderId || 'New Order'}</span>
                {selectedTable && (
                  <>
                    <span className="text-red-200">|</span>
                    <span>Table {selectedTable}</span>
                  </>
                )}
              </div>
              <button onClick={handleCancelOrder} className="text-xs font-medium text-red-200 hover:text-white transition-colors">{orderId ? 'Cancel' : 'Clear'}</button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 max-h-[28.5rem] px-3 py-1.5 divide-y divide-gray-100">
              {cart.length > 0 ? cart.map(item => (
                <CartItem key={item.cartId} item={item} onUpdate={handleUpdateQuantity} onRemove={handleRemoveItem} />
              )) : (
                <div className="flex flex-col items-center justify-center py-4 text-gray-400 text-sm">
                  <p>Cart is empty</p>
                  <p className="text-xs mt-1">Click a variant to add</p>
                </div>
              )}
            </div>

            <div className="px-3 pt-3 pb-0.5 border-t border-gray-100 flex-shrink-0">
              <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-medium text-gray-500">Subtotal</span>
                <span className="text-xl font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <button disabled={isCartEmpty} onClick={() => handleSaveKOT(false)} className="flex-1 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors">Save KOT</button>
                  <button disabled={isCartEmpty} onClick={() => handleSaveKOT(true)} className="flex-1 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors">Save & Print KOT</button>
                </div>

                <button
                  onClick={handleOpenBillModal}
                  disabled={isCartEmpty || isSavingForBill}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg text-sm font-bold shadow-sm transition-colors disabled:cursor-not-allowed"
                >
                  {isSavingForBill ? 'Saving...' : 'Proceed to Bill'}
                </button>
              </div>
            </div>
          </div>

          <BillModal
            isOpen={isBillModalOpen}
            onClose={() => setIsBillModalOpen(false)}
            cart={cart}
            onGenerateBill={handleGenerateBill}
            isBillingLoading={isBillingLoading}
            tableNumber={selectedTable}
            orderType={currentOrderType}
          />
        </div>
      )}
    </div>
  );
};

export default Orders;