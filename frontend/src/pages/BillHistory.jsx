import React, { useState, useEffect, useCallback, useRef } from 'react';
import billService from '../services/billService';
import { useToast } from '../lib/ToastContext';

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
        // FIX: Neutrals by default. Light orange ONLY when active/selected.
        className={`w-full px-3 py-2 rounded-lg text-sm text-left flex items-center justify-between transition-all ${isActive
            ? 'bg-[#fff5f1] border border-[#ff6d33]/30 text-[#ff6d33] font-medium'
            : 'bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-400'
          } focus:outline-none focus:ring-2 focus:ring-[#ff6d33]/20 focus:border-[#ff6d33]`}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg className="w-4 h-4 flex-shrink-0 ml-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${value === opt.value
                    ? "bg-[#fff5f1] text-[#ff6d33] font-medium"
                    : "text-neutral-800 hover:bg-neutral-50"
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

  const handleResetFilters = () => {
    setSearch("");
    setMonth(currentMonth);
    setYear(currentYear);
    setPaymentType("");
    setOrderType("");
  };

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

      const res = await billService.getBills(params);
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
      const res = await billService.getBillById(billId);
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
    <div className="h-full w-full flex flex-col gap-6 p-4 lg:p-6 overflow-hidden">

      {/* PAGE TITLE & RESET */}
      <div className="flex items-end justify-between flex-shrink-0">
        <h1 className="text-3xl font-extrabold italic text-neutral-900 tracking-tight">Bill History</h1>
        <button
          onClick={handleResetFilters}
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-white transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {/* TOP FILTERS */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Search phone, item, operator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-3 pr-9 py-2 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ff6d33]/20 focus:border-[#ff6d33] transition-all ${search ? 'bg-[#fff5f1] border border-[#ff6d33]/30 font-medium' : 'bg-white border border-neutral-200'
                }`}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
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
      <div className="flex-1 bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col overflow-hidden min-h-0">

        {/* HEADER: Clean neutral gray header */}
        <div className="grid grid-cols-7 gap-4 px-5 py-3 bg-neutral-50 border-b border-neutral-200 text-[11px] font-bold uppercase tracking-widest text-neutral-500 flex-shrink-0">
          <div className="text-left">Date</div>
          <div className="text-right">Amount</div>
          <div className="text-center">Pay</div>
          <div className="text-center">Type</div>
          <div className="text-center">Operator</div>
          <div className="text-center">Phone</div>
          <div className="text-center">View</div>
        </div>

        {/* BODY: Clean white with subtle hover */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="animate-pulse text-neutral-400">Loading bills...</span>
            </div>
          ) : bills.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-10">
              <p className="text-lg font-medium text-neutral-900">No bills found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            bills.map((bill) => (
              <div key={bill.billId} className="grid grid-cols-7 gap-4 px-5 py-3 items-center hover:bg-neutral-50 transition-colors">

                <div className="text-xs text-neutral-900 leading-tight truncate text-left">
                  {formatDateTime(bill.date)}
                </div>

                <div className="text-sm text-neutral-900 text-right font-medium">
                  ₹{bill.totalAmount.toFixed(2)}
                </div>

                {/* Removed orange from standard badges, using clean neutral */}
                <div className="flex justify-center">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-neutral-100 text-neutral-600">
                    {bill.paymentType}
                  </span>
                </div>

                <div className="flex justify-center">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-neutral-100 text-neutral-600">
                    {bill.orderType === 'dine-in' ? 'Dine-in' : 'Takeaway'}
                  </span>
                </div>

                <div className="text-center text-xs text-neutral-900 truncate">
                  {bill.operatorName || <span className="text-neutral-300">—</span>}
                </div>

                <div className="text-center text-xs text-neutral-500 truncate">
                  {bill.customerPhone || <span className="text-neutral-300">—</span>}
                </div>

                {/* Reserved dark orange ONLY for interactive action hover */}
                <div className="flex justify-center">
                  <button
                    onClick={() => handleViewBill(bill.billId)}
                    disabled={viewLoading}
                    className="p-1.5 text-neutral-400 hover:text-[#ff6d33] hover:bg-[#fff5f1] rounded-lg transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION: Clean, minimal */}
        {pagination.pages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-white flex-shrink-0">
            <p className="text-xs text-neutral-500">
              Page {pagination.page} out of {pagination.pages}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>Prev
              </button>
              <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BILL MODAL */}
      {isModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 border border-neutral-200 flex flex-col max-h-[90vh]">

            <div className="flex items-center justify-between p-4 border-b border-neutral-200 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Bill Details</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Table {selectedBill.tableNumber} &bull; {formatDateTime(selectedBill.createdAt)}</p>
                <p className="text-xs text-neutral-500 mt-0.5">Operator: <span className="font-medium text-neutral-900">{selectedBill.operatorName}</span></p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 p-1 rounded-lg hover:bg-neutral-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">

              <div className={`grid gap-3 ${selectedBill.customerPhone ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <div className="bg-neutral-50 p-2 rounded-lg text-center border border-neutral-100">
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Type</p>
                  <p className="text-sm font-medium text-neutral-900 capitalize mt-0.5">{selectedBill.orderType}</p>
                </div>
                <div className="bg-neutral-50 p-2 rounded-lg text-center border border-neutral-100">
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Payment</p>
                  <p className="text-sm font-medium text-neutral-900 uppercase mt-0.5">{selectedBill.paymentType}</p>
                </div>

                {selectedBill.customerPhone && (
                  <div className="bg-neutral-50 p-2 rounded-lg text-center border border-neutral-100">
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase">Phone</p>
                    <p className="text-sm font-medium text-neutral-900 mt-0.5">{selectedBill.customerPhone}</p>
                  </div>
                )}
              </div>

              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-[11px] font-bold uppercase text-neutral-500">Item</th>
                      <th className="text-center px-3 py-2 text-[11px] font-bold uppercase text-neutral-500">Qty</th>
                      <th className="text-right px-3 py-2 text-[11px] font-bold uppercase text-neutral-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {selectedBill.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-neutral-900">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-[11px] text-neutral-500">{item.variant} &bull; ₹{item.price}</p>
                        </td>
                        <td className="px-3 py-2 text-center text-neutral-900 text-sm">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-neutral-900 text-sm">₹{item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Kept Dark Theme here for POS receipt contrast, using #ff6d33 as the total pop */}
              <div className="bg-neutral-deep rounded-xl p-4 text-white space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/70">Subtotal</span><span>₹{selectedBill.subtotal.toFixed(2)}</span></div>
                {selectedBill.discount > 0 && (<div className="flex justify-between"><span className="text-white/70">Discount</span><span className="text-red-400">- ₹{selectedBill.discount.toFixed(2)}</span></div>)}
                <div className="flex justify-between"><span className="text-white/70">GST</span><span>+ ₹{selectedBill.gst.toFixed(2)}</span></div>
                <div className="border-t border-white/20 pt-3 mt-3 flex justify-between items-end">
                  <span className="text-sm font-bold text-white/70">Total Paid</span>
                  <span className="text-2xl font-extrabold text-[#ff6d33]">₹{selectedBill.totalAmount.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Footer reserved entirely for the core #ff6d33 action */}
            <div className="p-4 border-t border-neutral-200 bg-white rounded-b-2xl flex-shrink-0">
              <button onClick={handlePrint} className="w-full py-2.5 bg-[#ff6d33] hover:bg-orange-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
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