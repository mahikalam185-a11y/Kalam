import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { PaymentMethod } from '../../types';
import { X, Wallet, Check, CreditCard, Banknote } from 'lucide-react';

export const TopupModal: React.FC = () => {
  const {
    members,
    activeModal,
    closeModal,
    topupMemberBalance,
    openModal,
    settings
  } = useCyberCafe();

  const [targetMemberId, setTargetMemberId] = useState<string>(members[0]?.id || '');
  const [amount, setAmount] = useState<number>(20);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  if (activeModal !== 'topup') return null;

  const member = members.find(m => m.id === targetMemberId);

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMemberId || finalAmount <= 0) return;

    topupMemberBalance(targetMemberId, finalAmount, paymentMethod);
    closeModal();
    openModal('receipt');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Top-up Member Wallet Credits</h3>
              <p className="text-xs text-slate-400">Preload gaming & cafe balance</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTopup} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Select Member Account
            </label>
            <select
              value={targetMemberId}
              onChange={(e) => setTargetMemberId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-hidden focus:border-cyan-500"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.memberCode}) — Current Balance: ${m.balance.toFixed(2)}
                </option>
              ))}
            </select>
            {member && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs flex items-center justify-between">
                <span className="text-slate-400">Current Balance:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {settings.currencySymbol}{member.balance.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Quick Amounts */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Top-up Amount
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[10, 20, 50, 100].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { setAmount(amt); setCustomAmount(''); }}
                  className={`py-2 text-xs font-mono font-semibold rounded-lg border transition-colors ${
                    amount === amt && !customAmount
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="1"
                placeholder="Or enter custom amount..."
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-hidden focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Payment Method Received
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash Received</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card Terminal</span>
              </button>
            </div>
          </div>

          {/* Summary */}
          {member && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">New Resulting Balance</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                {settings.currencySymbol}{(member.balance + finalAmount).toFixed(2)}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={finalAmount <= 0}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Confirm & Print Reload Receipt</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
