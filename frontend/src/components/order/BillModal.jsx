import React, { useState } from 'react';

const BillModal = ({ isOpen, onClose, cart, onGenerateBill, isBillingLoading }) => {
  const [discount, setDiscount] = useState(0);
  const [gstPercent] = useState(5);
  const [eBillNumber, setEBillNumber] = useState('');
  const [isEBillEnabled, setIsEBillEnabled] = useState(false);
  const [paymentType, setPaymentType] = useState('Cash');

  const isEBillValid = /^\d{10}$/.test(eBillNumber);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Number(discount) || 0;
  const updatedSubtotal = subtotal - discountAmount;
  const gstAmount = updatedSubtotal * (gstPercent / 100);
  const finalTotal = updatedSubtotal + gstAmount;

  const handleSave = (shouldPrint = false) => {
    const phone = isEBillValid ? eBillNumber : null;
    const sendEBill = isEBillEnabled && isEBillValid;
    onGenerateBill(discountAmount, paymentType, phone, shouldPrint, sendEBill);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Generate Bill</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-4 flex-1 overflow-y-auto">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Discount (₹)</label>
              <input 
                type="number" 
                value={discount} 
                onChange={(e) => {
                  let val = e.target.value;
                  if (val === '') { setDiscount(0); return; }
                  val = val.replace(/^0+/, '') || '0';
                  setDiscount(val);
                }} 
                placeholder="0" 
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">GST (%)</label>
              <input type="text" value={`${gstPercent}%`} disabled className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed" />
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 text-white space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Discount</span><span className="text-red-400">- ₹{discountAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Updated Subtotal</span><span>₹{updatedSubtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">GST (5%)</span><span>+ ₹{gstAmount.toFixed(2)}</span></div>

            <div className="border-t border-white/20 pt-3 mt-3 flex justify-between items-end">
              <span className="text-sm font-bold text-gray-300">Final Total</span>
              <span className="text-2xl font-extrabold text-red-400">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Payment Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['Cash', 'Card', 'UPI'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPaymentType(opt)}
                  className={`py-2.5 rounded-lg border-2 transition-colors text-xs font-semibold ${paymentType === opt ? 'bg-red-50 border-red-500 text-red-500' : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-900">E-Bill (WhatsApp)</label>
              <div
                onClick={() => isEBillValid && setIsEBillEnabled(!isEBillEnabled)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${isEBillEnabled ? 'bg-red-500' : 'bg-gray-300'} ${!isEBillValid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${isEBillEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>
            <input
              type="text"
              value={eBillNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setEBillNumber(val);
                if (val.length === 10) setIsEBillEnabled(true);
              }}
              placeholder="Enter 10-digit number"
              className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 ${eBillNumber.length > 0 && !isEBillValid ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-red-500'}`}
            />
            {eBillNumber.length > 0 && !isEBillValid && (
              <p className="text-[10px] text-red-500 mt-1">Must be exactly 10 digits.</p>
            )}
          </div>

        </div>

        <div className="flex gap-2 p-4 border-t border-gray-100 bg-white rounded-b-2xl flex-shrink-0">
          <button onClick={onClose} disabled={isBillingLoading} className="flex-1 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
          <button onClick={() => handleSave(false)} disabled={isBillingLoading} className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
          <button onClick={() => handleSave(true)} disabled={isBillingLoading} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Save & Print</button>
        </div>
      </div>
    </div>
  );
};

export default BillModal;