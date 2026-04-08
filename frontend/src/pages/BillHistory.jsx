import React, { useState, useEffect, useCallback, useRef } from 'react';
import orderService from '../services/orderService';
import { useToast } from '../context/ToastContext';

// --- Custom Dropdown Component ---
const FilterSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;
  const isActive = value !== "" && value !== undefined;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        // 2. Added font-semibold to active state for bold orange look
        className={`w-full px-3 py-2 border rounded-lg text-sm text-left flex items-center justify-between transition-colors ${
          isActive 
            ? 'bg-brand-pale border-brand text-brand font-semibold' 
            : 'bg-surface-gray border-border-main text-text-placeholder hover:border-gray-400'
        } focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand`}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg className="w-4 h-4 flex-shrink-0 ml-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-surface-white border border-border-main rounded-xl shadow-xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  value === opt.value 
                    ? "bg-brand-pale text-brand font-medium" 
                    : "text-text-primary hover:bg-surface-gray"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const BillHistory = () => {
  const { showToast } = useToast();

  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 });
  
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentYear = String(new Date().getFullYear());

  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [paymentType, setPaymentType] = useState("");
  const [orderType, setOrderType] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const months = [
    { value: "", label: "All Months" },
    ...["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      .map((m, i) => ({ value: String(i + 1).padStart(2, '0'), label: m }))
  ];

  const years = [
    { value: "", label: "All Years" },
    ...Array.from({ length: 5 }, (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i) }))
  ];

  const paymentOptions = [
    { value: "", label: "All Payments" },
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "card", label: "Card" }
  ];

  const orderTypeOptions = [
    { value: "", label: "All Types" },
    { value: "dine-in", label: "Dine-in" },
    { value: "takeaway", label: "Takeaway" }
  ];

  const fetchBills = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      
      if (search) params.search = search;
      if (month) params.month = parseInt(month);
      if (year) params.year = parseInt(year);
      else if (month) params.year = parseInt(currentYear); 
      if (paymentType) params.paymentType = paymentType;
      if (orderType) params.orderType = orderType;

      const res = await orderService.getBills(params);
      setBills(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      showToast("Failed to fetch bills", error);
    } finally {
      setLoading(false);
    }
  }, [search, month, year, paymentType, orderType, showToast, currentYear]);

  useEffect(() => {
    fetchBills(1);
  }, [fetchBills]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) fetchBills(newPage);
  };

  const handleViewBill = async (billId) => {
    setViewLoading(true);
    try {
      const res = await orderService.getBillById(billId);
      setSelectedBill(res.data.data);
      setIsModalOpen(true);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to fetch bill details", "error");
    } finally {
      setViewLoading(false);
    }
  };

  const handlePrint = () => {
    if (!selectedBill) return;
    const data = selectedBill;
    const itemsHtml = data.items.map(item => `<tr><td style="padding: 4px 0; font-size: 12px;">${item.quantity}x ${item.name} (${item.variant})</td><td style="padding: 4px 0; text-align: right; font-size: 12px;">₹${item.subtotal.toFixed(2)}</td></tr>`).join('');
    const fullReceiptHtml = `<html><head><title>Bill - Table ${data.tableNumber}</title><style>body{font-family:'Courier New',Courier,monospace;width:300px;margin:0 auto;padding:20px;color:#000}h2{text-align:center;margin-bottom:0;font-size:20px;text-transform:uppercase}.sub{text-align:center;font-size:12px;color:#555;margin-bottom:20px}table{width:100%;border-collapse:collapse;margin-bottom:20px}th{text-align:left;font-size:12px;border-bottom:1px solid #000;padding-bottom:4px}.totals{width:100%;font-size:12px}.totals tr td:last-child{text-align:right}.final-total{font-size:16px;font-weight:bold;border-top:2px solid #000;margin-top:10px}.final-total td{padding-top:8px!important}.footer{text-align:center;margin-top:30px;font-size:12px;color:#555}</style></head><body><h2>CROSTA PIZZA</h2><div class="sub">Table ${data.tableNumber} | ${data.orderType.toUpperCase()}</div><table><thead><tr><th>Item</th><th style="text-align:right;">Amount</th></tr></thead><tbody>${itemsHtml}</tbody></table><table class="totals"><tr><td>Subtotal</td><td>₹${data.subtotal.toFixed(2)}</td></tr>${data.discount > 0 ? `<tr><td>Discount</td><td>- ₹${data.discount.toFixed(2)}</td></tr>` : ''}<tr><td>GST</td><td>+ ₹${data.gst.toFixed(2)}</td></tr><tr class="final-total"><td>TOTAL</td><td>₹${data.totalAmount.toFixed(2)}</td></tr></table><div class="footer">Operator: ${data.operatorName}<br>Payment: ${data.paymentType.toUpperCase()}<br>Billed: ${new Date(data.createdAt).toLocaleString()}</div></body></html>`;
    const printWindow = window.open('', '_blank');
    if (!printWindow) { showToast("Please allow popups to print", "error"); return; }
    printWindow.document.write(fullReceiptHtml);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); printWindow.close(); };
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="h-full w-full flex flex-col gap-4 overflow-hidden">
      
      {/* TOP FILTERS */}
      <div className="bg-surface-white rounded-xl border border-border-main p-4 shadow-sm flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Search phone, item, operator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-3 pr-9 py-2 border rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors ${
                search ? 'bg-brand-pale border-brand font-semibold' : 'bg-surface-gray border-border-main'
              }`}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand hover:text-brand-hover">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          <FilterSelect value={month} onChange={setMonth} options={months} placeholder="Select Month" />
          <FilterSelect value={year} onChange={setYear} options={years} placeholder="Select Year" />
          
          <div className="flex gap-2">
            <div className="flex-1">
              <FilterSelect value={paymentType} onChange={setPaymentType} options={paymentOptions} placeholder="Payment" />
            </div>
            <div className="flex-1">
              <FilterSelect value={orderType} onChange={setOrderType} options={orderTypeOptions} placeholder="Type" />
            </div>
          </div>
        </div>
      </div>

      {/* LIST & PAGINATION CONTAINER */}
      <div className="flex-1 bg-surface-white rounded-xl border border-border-main shadow-sm flex flex-col overflow-hidden min-h-0">
        
        {/* 3. Clever Table Header using subtle orange gradient and bottom border */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gradient-to-r from-orange-50 via-orange-50/50 to-surface-gray border-b-2 border-orange-200 text-[11px] font-bold uppercase tracking-wider text-orange-700 flex-shrink-0">
          <div className="col-span-3">Date</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-1 text-center">Pay</div>
          <div className="col-span-1 text-center">Type</div>
          <div className="col-span-2 text-center">Operator</div>
          <div className="col-span-2 text-center">Phone</div>
          <div className="col-span-1 text-center">View</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-border-main">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="animate-pulse text-text-secondary">Loading bills...</span>
            </div>
          ) : bills.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary py-10">
              <p className="text-lg font-medium">No bills found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            bills.map((bill) => (
              <div key={bill.billId} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-surface-gray/50 transition-colors">
                
                <div className="col-span-3 text-xs text-text-primary leading-tight">
                  {formatDateTime(bill.date)}
                </div>

                <div className="col-span-2 text-lg text-brand font-semibold text-right">
                  ₹{bill.totalAmount.toFixed(2)}
                </div>

                {/* 1. Reverted to full names */}
                <div className="col-span-1 flex justify-center">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-surface-gray border border-border-main text-text-secondary">
                    {bill.paymentType}
                  </span>
                </div>

                <div className="col-span-1 flex justify-center">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-surface-gray border border-border-main text-text-secondary">
                    {bill.orderType === 'dine-in' ? 'Dine-in' : 'Takeaway'}
                  </span>
                </div>

                <div className="col-span-2 text-center text-xs text-text-primary truncate px-1">
                  {bill.operatorName || <span className="text-gray-300">—</span>}
                </div>

                <div className="col-span-2 text-center text-xs text-text-secondary">
                  {bill.customerPhone || <span className="text-gray-300">—</span>}
                </div>

                <div className="col-span-1 flex justify-center">
                  <button 
                    onClick={() => handleViewBill(bill.billId)} 
                    disabled={viewLoading}
                    className="p-1.5 text-gray-400 hover:text-brand hover:bg-brand-pale rounded-lg transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
        {pagination.pages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-main bg-surface-gray flex-shrink-0">
            <p className="text-xs text-text-secondary">
              Page <span className="text-text-primary font-medium">{pagination.page}</span> out of <span className="text-text-primary font-medium">{pagination.pages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="flex items-center gap-1 px-3 py-1.5 border border-border-main rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>Prev
              </button>
              <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="flex items-center gap-1 px-3 py-1.5 border border-border-main rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BILL MODAL */}
      {isModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-white rounded-2xl shadow-xl w-full max-w-lg mx-4 border border-border-main flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-4 border-b border-border-main flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-text-primary">Bill Details</h2>
                <p className="text-xs text-text-secondary mt-0.5">Table {selectedBill.tableNumber} &bull; {formatDateTime(selectedBill.createdAt)}</p>
                <p className="text-xs text-text-secondary mt-0.5">Operator: <span className="font-medium text-text-primary">{selectedBill.operatorName}</span></p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface-gray transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              
              <div className={`grid gap-3 ${selectedBill.customerPhone ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <div className="bg-surface-gray p-2 rounded-lg text-center">
                  <p className="text-[10px] font-semibold text-text-secondary uppercase">Type</p>
                  <p className="text-sm font-medium text-text-primary capitalize mt-0.5">{selectedBill.orderType}</p>
                </div>
                <div className="bg-surface-gray p-2 rounded-lg text-center">
                  <p className="text-[10px] font-semibold text-text-secondary uppercase">Payment</p>
                  <p className="text-sm font-medium text-text-primary uppercase mt-0.5">{selectedBill.paymentType}</p>
                </div>
                
                {selectedBill.customerPhone && (
                  <div className="bg-surface-gray p-2 rounded-lg text-center">
                    <p className="text-[10px] font-semibold text-text-secondary uppercase">Phone</p>
                    <p className="text-sm font-medium text-text-primary mt-0.5">{selectedBill.customerPhone}</p>
                  </div>
                )}
              </div>

              <div className="border border-border-main rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface-gray">
                    <tr>
                      <th className="text-left px-3 py-2 text-[11px] font-bold uppercase text-text-secondary">Item</th>
                      <th className="text-center px-3 py-2 text-[11px] font-bold uppercase text-text-secondary">Qty</th>
                      <th className="text-right px-3 py-2 text-[11px] font-bold uppercase text-text-secondary">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main">
                    {selectedBill.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-text-primary">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-[11px] text-text-secondary">{item.variant} &bull; ₹{item.price}</p>
                        </td>
                        <td className="px-3 py-2 text-center text-text-primary text-sm">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-text-primary text-sm">₹{item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-neutral-deep rounded-xl p-4 text-white space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>₹{selectedBill.subtotal.toFixed(2)}</span></div>
                {selectedBill.discount > 0 && (<div className="flex justify-between"><span className="text-gray-400">Discount</span><span className="text-red-400">- ₹{selectedBill.discount.toFixed(2)}</span></div>)}
                <div className="flex justify-between"><span className="text-gray-400">GST</span><span>+ ₹{selectedBill.gst.toFixed(2)}</span></div>
                <div className="border-t border-white/20 pt-3 mt-3 flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-300">Total Paid</span>
                  <span className="text-2xl font-extrabold text-brand">₹{selectedBill.totalAmount.toFixed(2)}</span>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-border-main bg-surface-gray rounded-b-2xl flex-shrink-0">
              <button onClick={handlePrint} className="w-full py-2.5 bg-brand hover:bg-brand-hover text-surface-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillHistory;