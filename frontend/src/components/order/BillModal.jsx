// src/components/order/BillModal.jsx
import React, { useState } from 'react';

const BillModal = ({ isOpen, onClose, cart, onSavePlaceholder }) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-white rounded-2xl shadow-xl w-full max-w-md mx-4 border border-border-main">
        <div className="flex items-center justify-between p-4 border-b border-border-main">
          <h2 className="text-base font-bold text-text-primary">Generate Bill</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface-gray">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">DISCOUNT (₹)</label>
              <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" className="w-full px-3 py-2 bg-surface-gray border border-border-main rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"/>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">GST (%)</label>
              <input type="text" value={`${gstPercent}%`} disabled className="w-full px-3 py-2 bg-surface-gray border border-border-main rounded-lg text-sm text-text-secondary cursor-not-allowed"/>
            </div>
          </div>

          <div className="bg-surface-gray p-3 rounded-lg border border-border-main">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-text-primary">E-Bill</label>
              <div 
                onClick={() => isEBillValid && setIsEBillEnabled(!isEBillEnabled)} 
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${isEBillEnabled ? 'bg-brand' : 'bg-gray-300'} ${!isEBillValid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${isEBillEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>
            <input 
              type="text" 
              value={eBillNumber} 
              onChange={(e) => {
                setEBillNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                if (isEBillEnabled) setIsEBillEnabled(false);
              }}
              placeholder="Enter 10-digit number"
              className={`w-full px-3 py-2 bg-surface-white border rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/30 ${
                eBillNumber.length > 0 && !isEBillValid ? 'border-red-400 focus:ring-red-200' : 'border-border-main focus:border-brand'
              }`}
            />
            {eBillNumber.length > 0 && !isEBillValid && (
              <p className="text-[10px] text-red-500 mt-1">Must be exactly 10 digits.</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">PAYMENT TYPE</label>
            <div className="grid grid-cols-3 gap-2">
              {['Cash', 'Card', 'UPI'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPaymentType(opt)}
                  className={`py-2 rounded-lg border-2 transition-all text-xs font-semibold ${
                    paymentType === opt ? 'bg-brand-pale border-brand text-brand' : 'bg-surface-white border-border-main text-text-secondary hover:border-gray-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-neutral-deep rounded-lg p-3 text-white space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Discount</span><span className="text-red-400">- ₹{discountAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Updated Subtotal</span><span>₹{updatedSubtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">GST (5%)</span><span>+ ₹{gstAmount.toFixed(2)}</span></div>
            <div className="border-t border-white/20 pt-1.5 mt-1.5 flex justify-between text-sm font-bold">
              <span>Final Total</span><span className="text-brand">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-border-main bg-surface-gray rounded-b-2xl">
          <button onClick={onClose} className="flex-1 py-2 border border-border-main text-text-secondary hover:bg-surface-white rounded-lg text-sm font-medium transition-colors">Cancel</button>
          <button onClick={() => onSavePlaceholder('save')} className="flex-1 py-2 bg-surface-white border border-border-main text-text-primary hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">Save</button>
          <button onClick={() => onSavePlaceholder('print')} className="flex-1 py-2 bg-brand hover:bg-brand-hover text-surface-white rounded-lg text-sm font-medium shadow-sm transition-colors">Save & Print</button>
        </div>
      </div>
    </div>
  );
};

export default BillModal;