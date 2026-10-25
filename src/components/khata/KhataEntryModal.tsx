import React, { useState, useEffect } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { X, Check, ArrowDownLeft, ArrowUpRight, Calculator, Receipt } from 'lucide-react';

export const KhataEntryModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    khataCustomers,
    selectedKhataCustomerId,
    addKhataEntry,
    settings
  } = useCyberCafe();

  const [customerId, setCustomerId] = useState<string>(() => {
    if (selectedKhataCustomerId) return selectedKhataCustomerId;
    return khataCustomers[0]?.id || '';
  });

  // Entry Mode: 'bill_due' = New bill with paid & due; 'joma' = Payment settlement; 'baki' = Direct credit
  const [entryMode, setEntryMode] = useState<'bill_due' | 'baki' | 'joma'>('bill_due');
  
  const [totalBill, setTotalBill] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [dueAmount, setDueAmount] = useState<string>('');
  const [serviceName, setServiceName] = useState<string>('Learner Licence (LL) Application');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (selectedKhataCustomerId) {
      setCustomerId(selectedKhataCustomerId);
    } else if (khataCustomers.length > 0 && !customerId) {
      setCustomerId(khataCustomers[0].id);
    }
  }, [selectedKhataCustomerId, khataCustomers]);

  // Auto-calculate Due when Total Bill or Paid Amount changes in 'bill_due' mode
  const handleTotalBillChange = (val: string) => {
    setTotalBill(val);
    const bill = parseFloat(val) || 0;
    const paid = parseFloat(paidAmount) || 0;
    const computedDue = Math.max(0, bill - paid);
    setDueAmount(computedDue > 0 ? computedDue.toString() : '0');
  };

  const handlePaidAmountChange = (val: string) => {
    setPaidAmount(val);
    if (entryMode === 'bill_due') {
      const bill = parseFloat(totalBill) || 0;
      const paid = parseFloat(val) || 0;
      const computedDue = Math.max(0, bill - paid);
      setDueAmount(computedDue > 0 ? computedDue.toString() : '0');
    }
  };

  if (activeModal !== 'khataEntry') return null;

  const targetCustomer = khataCustomers.find(k => k.id === customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    if (entryMode === 'bill_due') {
      const bill = parseFloat(totalBill) || 0;
      const paid = parseFloat(paidAmount) || 0;
      const due = parseFloat(dueAmount) || Math.max(0, bill - paid);

      if (bill <= 0 && due <= 0) return;

      addKhataEntry({
        customerId,
        type: due > 0 ? 'baki' : 'joma',
        amount: due > 0 ? due : paid,
        totalBill: bill,
        paidAmount: paid,
        dueAmount: due,
        serviceName: serviceName.trim() || 'Service & Bill Entry',
        notes: notes.trim() || `Total Bill: ₹${bill}, Paid: ₹${paid}, Due: ₹${due}`
      });
    } else if (entryMode === 'baki') {
      const due = parseFloat(dueAmount) || 0;
      if (due <= 0) return;

      addKhataEntry({
        customerId,
        type: 'baki',
        amount: due,
        totalBill: due,
        paidAmount: 0,
        dueAmount: due,
        serviceName: serviceName.trim() || 'Credit / বাকি',
        notes: notes.trim() || undefined
      });
    } else {
      // Payment received (joma)
      const paid = parseFloat(paidAmount) || 0;
      if (paid <= 0) return;

      addKhataEntry({
        customerId,
        type: 'joma',
        amount: paid,
        totalBill: paid,
        paidAmount: paid,
        dueAmount: 0,
        serviceName: serviceName.trim() || 'Payment Received (টাকা জমা)',
        notes: notes.trim() || 'Payment received towards pending khata balance'
      });
    }

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-cyan-400" />
              <span>Digital Khata Entry / ডিজিটাল খাতা হিসাব এন্ট্রি</span>
            </h3>
            <p className="text-xs text-slate-400">Record Total Bill, Payment Received, and Due Balance</p>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Customer select & current due */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400">Select Customer / গ্রাহক নির্বাচন</label>
              {targetCustomer && (
                <span className="text-[11px] font-mono text-slate-400">
                  Current Due: <span className="font-bold text-rose-400">{settings.currencySymbol}{targetCustomer.totalDue.toFixed(2)}</span>
                </span>
              )}
            </div>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500 font-medium"
            >
              {khataCustomers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.village}) — Due: ₹{c.totalDue.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher */}
          <div>
            <label className="block text-slate-400 mb-1">Transaction Category / লেনদেনের ধরন</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setEntryMode('bill_due');
                  setServiceName('Learner Licence (LL) Application');
                }}
                className={`py-2 px-2 text-center text-[11px] font-semibold rounded-md transition-colors flex flex-col items-center gap-1 ${
                  entryMode === 'bill_due'
                    ? 'bg-cyan-950/80 border border-cyan-500 text-cyan-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>বিল ও বাকি (Bill & Due)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEntryMode('joma');
                  setServiceName('Cash Payment Received');
                }}
                className={`py-2 px-2 text-center text-[11px] font-semibold rounded-md transition-colors flex flex-col items-center gap-1 ${
                  entryMode === 'joma'
                    ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>টাকা জমা (Receive Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEntryMode('baki');
                  setServiceName('Direct Credit');
                }}
                className={`py-2 px-2 text-center text-[11px] font-semibold rounded-md transition-colors flex flex-col items-center gap-1 ${
                  entryMode === 'baki'
                    ? 'bg-rose-950/80 border border-rose-500 text-rose-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" />
                <span>টাকা বাকি (Give Credit)</span>
              </button>
            </div>
          </div>

          {/* Service / Work item */}
          <div>
            <label className="block text-slate-400 mb-1">Work / Service Name (কাজের বিবরণ)</label>
            <input
              type="text"
              required
              placeholder="e.g. Learner Licence (LL), PAN Card, Voter PVC..."
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500 font-medium"
            />
          </div>

          {/* Detailed Financial Calculation Row: Total Bill, Paid Amount, Due Amount */}
          {entryMode === 'bill_due' && (
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              
              {/* Total Bill */}
              <div>
                <label className="block text-slate-300 text-[11px] font-medium mb-1">
                  Total Bill (মোট বিল) *
                </label>
                <div className="relative">
                  <span className="text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 font-mono">
                    {settings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="350"
                    value={totalBill}
                    onChange={(e) => handleTotalBillChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm font-bold rounded-lg pl-7 pr-2 py-1.5 focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Payment Given / Paid */}
              <div>
                <label className="block text-emerald-400 text-[11px] font-medium mb-1">
                  Payment Given (জমা)
                </label>
                <div className="relative">
                  <span className="text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 font-mono">
                    {settings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="1"
                    placeholder="100"
                    value={paidAmount}
                    onChange={(e) => handlePaidAmountChange(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-900/60 text-emerald-300 font-mono text-sm font-bold rounded-lg pl-7 pr-2 py-1.5 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Remaining Due */}
              <div>
                <label className="block text-rose-400 text-[11px] font-medium mb-1">
                  Remaining Due (বাকি)
                </label>
                <div className="relative">
                  <span className="text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 font-mono">
                    {settings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="1"
                    placeholder="250"
                    value={dueAmount}
                    onChange={(e) => setDueAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-rose-900/60 text-rose-300 font-mono text-sm font-bold rounded-lg pl-7 pr-2 py-1.5 focus:border-rose-500"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Joma (Payment Settlement) Input */}
          {entryMode === 'joma' && (
            <div>
              <label className="block text-emerald-400 mb-1 font-medium">
                Payment Amount Received (কত টাকা জমা দিলেন) *
              </label>
              <div className="relative">
                <span className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="250"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-emerald-800 text-emerald-300 font-mono text-base font-bold rounded-lg pl-8 pr-3 py-2 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Baki (Direct Credit) Input */}
          {entryMode === 'baki' && (
            <div>
              <label className="block text-rose-400 mb-1 font-medium">
                Due Amount Given (টাকা বাকি দিন) *
              </label>
              <div className="relative">
                <span className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="150"
                  value={dueAmount}
                  onChange={(e) => setDueAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-rose-800 text-rose-300 font-mono text-base font-bold rounded-lg pl-8 pr-3 py-2 focus:border-rose-500"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-slate-400 mb-1">Notes & Promises (মন্তব্য / প্রতিশ্রুতির তারিখ)</label>
            <input
              type="text"
              placeholder="e.g. Will pay ₹250 on next Monday after LL exam slot..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer ${
                entryMode === 'joma'
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save Khata Entry / হিসাব সেভ করুন</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
