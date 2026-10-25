import React, { useState, useEffect } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { X, Check, Edit3, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const EditKhataEntryModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    selectedKhataTransaction,
    editKhataEntry,
    settings
  } = useCyberCafe();

  const [serviceName, setServiceName] = useState('');
  const [totalBill, setTotalBill] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [dueAmount, setDueAmount] = useState('');
  const [type, setType] = useState<'baki' | 'joma'>('baki');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedKhataTransaction) {
      setServiceName(selectedKhataTransaction.serviceName || '');
      setType(selectedKhataTransaction.type);
      setTotalBill(selectedKhataTransaction.totalBill !== undefined ? selectedKhataTransaction.totalBill.toString() : selectedKhataTransaction.amount.toString());
      setPaidAmount(selectedKhataTransaction.paidAmount !== undefined ? selectedKhataTransaction.paidAmount.toString() : (selectedKhataTransaction.type === 'joma' ? selectedKhataTransaction.amount.toString() : '0'));
      setDueAmount(selectedKhataTransaction.dueAmount !== undefined ? selectedKhataTransaction.dueAmount.toString() : (selectedKhataTransaction.type === 'baki' ? selectedKhataTransaction.amount.toString() : '0'));
      setNotes(selectedKhataTransaction.notes || '');
    }
  }, [selectedKhataTransaction]);

  if (activeModal !== 'editKhataEntry' || !selectedKhataTransaction) return null;

  const handleTotalBillChange = (val: string) => {
    setTotalBill(val);
    const bill = parseFloat(val) || 0;
    const paid = parseFloat(paidAmount) || 0;
    const computedDue = Math.max(0, bill - paid);
    setDueAmount(computedDue > 0 ? computedDue.toString() : '0');
  };

  const handlePaidAmountChange = (val: string) => {
    setPaidAmount(val);
    const bill = parseFloat(totalBill) || 0;
    const paid = parseFloat(val) || 0;
    const computedDue = Math.max(0, bill - paid);
    setDueAmount(computedDue > 0 ? computedDue.toString() : '0');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bill = parseFloat(totalBill) || 0;
    const paid = parseFloat(paidAmount) || 0;
    const due = parseFloat(dueAmount) || Math.max(0, bill - paid);

    editKhataEntry(selectedKhataTransaction.id, {
      serviceName: serviceName.trim() || 'Service Work',
      totalBill: bill,
      paidAmount: paid,
      dueAmount: due,
      type: due > 0 ? 'baki' : (paid > 0 ? 'joma' : type),
      amount: due > 0 ? due : paid,
      notes: notes.trim() || undefined
    });

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Edit Khata Entry / হিসাব সংশোধন</span>
            </h3>
            <p className="text-xs text-slate-400">
              Customer: <span className="text-white font-medium">{selectedKhataTransaction.customerName}</span>
            </p>
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
          
          {/* Work / Service Name */}
          <div>
            <label className="block text-slate-400 mb-1">Work / Service Name (কাজের বিবরণ)</label>
            <input
              type="text"
              required
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500 font-medium"
            />
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-slate-400 mb-1">Transaction Nature</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setType('baki')}
                className={`py-1.5 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                  type === 'baki'
                    ? 'bg-rose-950/80 border border-rose-600 text-rose-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" />
                <span>টাকা বাকি (Due / Credit)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('joma')}
                className={`py-1.5 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                  type === 'joma'
                    ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>টাকা জমা (Payment Settlement)</span>
              </button>
            </div>
          </div>

          {/* 3-Column Inputs: Total Bill, Paid Amount, Due Amount */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <label className="block text-slate-300 text-[11px] font-medium mb-1">
                Total Bill (মোট বিল)
              </label>
              <div className="relative">
                <span className="text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 font-mono">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  step="1"
                  required
                  value={totalBill}
                  onChange={(e) => handleTotalBillChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm font-bold rounded-lg pl-7 pr-2 py-1.5 focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-emerald-400 text-[11px] font-medium mb-1">
                Paid (জমা দেওয়া)
              </label>
              <div className="relative">
                <span className="text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 font-mono">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  step="1"
                  value={paidAmount}
                  onChange={(e) => handlePaidAmountChange(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-900/60 text-emerald-300 font-mono text-sm font-bold rounded-lg pl-7 pr-2 py-1.5 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-rose-400 text-[11px] font-medium mb-1">
                Due (বাকি)
              </label>
              <div className="relative">
                <span className="text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 font-mono">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  step="1"
                  value={dueAmount}
                  onChange={(e) => setDueAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-rose-900/60 text-rose-300 font-mono text-sm font-bold rounded-lg pl-7 pr-2 py-1.5 focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-400 mb-1">Notes / Remarks (মন্তব্য)</label>
            <input
              type="text"
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
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Update Entry & Recalculate / আপডেট করুন</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
