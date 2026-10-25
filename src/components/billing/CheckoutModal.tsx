import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { PaymentMethod } from '../../types';
import {
  X,
  Receipt,
  CreditCard,
  Banknote,
  Wallet,
  QrCode,
  Check,
  AlertCircle
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    stations,
    members,
    selectedStationId,
    activeModal,
    closeModal,
    checkoutStation,
    openModal,
    calculateLiveBill,
    settings
  } = useCyberCafe();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [operatorNotes, setOperatorNotes] = useState<string>('');
  const [discountPct, setDiscountPct] = useState<number>(0);

  if (activeModal !== 'checkout' || !selectedStationId) return null;

  const station = stations.find(s => s.id === selectedStationId);
  if (!station || !station.currentSession) return null;

  const session = station.currentSession;
  const bill = calculateLiveBill(station);
  const member = session.memberId ? members.find(m => m.id === session.memberId) : null;

  // Effective discount
  const activeDiscountPct = discountPct > 0 ? discountPct : (session.isMember ? session.discountPct : 0);
  const effectiveDiscountAmount = Number(((bill.subtotal * activeDiscountPct) / 100).toFixed(2));
  const effectiveTaxable = Math.max(0, bill.subtotal - effectiveDiscountAmount);
  const effectiveTaxAmount = Number(((effectiveTaxable * (settings.taxRatePct / 100))).toFixed(2));
  const effectiveTotalAmount = Number((effectiveTaxable + effectiveTaxAmount).toFixed(2));

  const parsedCash = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, parsedCash - effectiveTotalAmount);
  const isCashInsufficient = paymentMethod === 'cash' && parsedCash > 0 && parsedCash < effectiveTotalAmount;
  const isWalletInsufficient = paymentMethod === 'wallet_balance' && member && member.balance < effectiveTotalAmount;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (isWalletInsufficient) return;

    const receipt = checkoutStation(station.id, paymentMethod, operatorNotes, activeDiscountPct);
    if (receipt) {
      closeModal();
      openModal('receipt');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Settle Bill & Checkout</h3>
              <p className="text-xs text-slate-400">{station.name} · {session.customerName}</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleCheckout} className="p-6 space-y-4">
          
          {/* Bill Summary Statement */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Terminal Time ({bill.durationMinutes} minutes billable)</span>
              <span className="font-mono tabular-nums text-slate-200">
                {settings.currencySymbol}{bill.timeCharge.toFixed(2)}
              </span>
            </div>

            {session.orders.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-500 uppercase tracking-wider">Cafe & Print Items</div>
                {session.orders.map(order => (
                  <div key={order.id} className="flex justify-between text-slate-400 pl-2">
                    <span className="truncate max-w-[240px]">
                      {order.name} <span className="font-mono text-slate-500">×{order.quantity}</span>
                    </span>
                    <span className="font-mono tabular-nums text-slate-300">
                      {settings.currencySymbol}{(order.price * order.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Discount selector chips: 0%, 5%, 10%, 15%, 20% */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Quick Discount / ডিসকাউন্ট (%):</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {activeDiscountPct}% {effectiveDiscountAmount > 0 ? `(-${settings.currencySymbol}${effectiveDiscountAmount.toFixed(2)})` : ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 5, 10, 15, 20].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDiscountPct(pct)}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                      activeDiscountPct === pct
                        ? 'bg-cyan-400 text-slate-950 shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-slate-300">
                  {settings.currencySymbol}{bill.subtotal.toFixed(2)}
                </span>
              </div>

              {effectiveDiscountAmount > 0 && (
                <div className="flex justify-between text-cyan-400">
                  <span>Applied Discount ({activeDiscountPct}%)</span>
                  <span className="font-mono tabular-nums">
                    -{settings.currencySymbol}{effectiveDiscountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Tax ({settings.taxRatePct}%)</span>
                <span className="font-mono tabular-nums text-slate-300">
                  {settings.currencySymbol}{effectiveTaxAmount.toFixed(2)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-bold text-white">
                <span>Total Amount Due</span>
                <span className="font-mono tabular-nums text-emerald-400 text-lg">
                  {settings.currencySymbol}{effectiveTotalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Payment Tender Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card Terminal</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('wallet_balance')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors ${
                  paymentMethod === 'wallet_balance'
                    ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Member Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('qr_pay')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors ${
                  paymentMethod === 'qr_pay'
                    ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Digital / QR</span>
              </button>
            </div>
          </div>

          {/* Cash Tendered & Change calculator */}
          {paymentMethod === 'cash' && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-400 mb-1">Cash Received ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={bill.totalAmount.toFixed(2)}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm font-mono px-3 py-1.5 rounded-lg focus:outline-hidden focus:border-cyan-500"
                  />
                </div>
                {/* Quick denomination chips */}
                <div className="flex items-center gap-1 pt-4">
                  {[10, 20, 50, 100].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashTendered(amt.toString())}
                      className="px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-slate-300"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {parsedCash > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400">Change Due to Customer</span>
                  <span className={`font-mono tabular-nums text-sm font-bold ${
                    isCashInsufficient ? 'text-rose-400' : 'text-cyan-400'
                  }`}>
                    {isCashInsufficient ? 'Insufficient Cash' : `${settings.currencySymbol}${changeDue.toFixed(2)}`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Member wallet validation */}
          {paymentMethod === 'wallet_balance' && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              {member ? (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available Member Wallet Balance</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {settings.currencySymbol}{member.balance.toFixed(2)}
                    </span>
                  </div>
                  {isWalletInsufficient && (
                    <div className="text-rose-400 text-[11px] flex items-center gap-1 pt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Insufficient wallet credits. Please top up or choose another payment method.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-amber-400">
                  Guest does not have a member account linked. Please use Cash, Card, or QR.
                </div>
              )}
            </div>
          )}

          {/* Operator Note */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Receipt Memo (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Paid in exact cash / Split bill note..."
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          {/* Footer Actions */}
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
              disabled={isWalletInsufficient || (paymentMethod === 'wallet_balance' && !member)}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Confirm Settle & Print Receipt</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
