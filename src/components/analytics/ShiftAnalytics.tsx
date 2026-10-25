import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import {
  BarChart3,
  Banknote,
  CreditCard,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  TrendingUp,
  Monitor
} from 'lucide-react';

const OPERATOR_AVATAR = '/src/assets/images/operator_avatar_1792901834607.jpg';

export const ShiftAnalytics: React.FC = () => {
  const {
    currentShift,
    transactions,
    stations,
    closeShift,
    startNewShift,
    settings
  } = useCyberCafe();

  const [countedCash, setCountedCash] = useState<string>('');
  const [handoverNotes, setHandoverNotes] = useState<string>('');
  const [shiftClosedSuccess, setShiftClosedSuccess] = useState(false);
  const [newOperatorName, setNewOperatorName] = useState('Elena Ross');
  const [newFloat, setNewFloat] = useState('150.00');

  // Calculate actual revenue breakdown from transactions
  const pcTimeRevenue = transactions.reduce((sum, t) => sum + t.timeCharge, 0);
  const cafeFoodRevenue = transactions.reduce((sum, t) => {
    const cafeItems = t.orders.filter(o => o.category === 'beverage' || o.category === 'snack' || o.category === 'meal');
    return sum + cafeItems.reduce((isum, item) => isum + (item.price * item.quantity), 0);
  }, 0);
  const printRetailRevenue = transactions.reduce((sum, t) => {
    const printItems = t.orders.filter(o => o.category === 'printing' || o.category === 'accessory');
    return sum + printItems.reduce((isum, item) => isum + (item.price * item.quantity), 0);
  }, 0);

  const totalCalculatedRevenue = pcTimeRevenue + cafeFoodRevenue + printRetailRevenue;

  // Drawer math
  const expectedCashInDrawer = currentShift.startingCash + currentShift.cashRevenue;
  const parsedCountedCash = parseFloat(countedCash) || 0;
  const cashDifference = parsedCountedCash - expectedCashInDrawer;

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedCountedCash <= 0) return;

    closeShift(parsedCountedCash, handoverNotes);
    setShiftClosedSuccess(true);
  };

  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOperatorName.trim()) return;

    startNewShift(newOperatorName.trim(), parseFloat(newFloat) || 150.00);
    setShiftClosedSuccess(false);
    setCountedCash('');
    setHandoverNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Shift Operator Header Card */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={OPERATOR_AVATAR}
            alt={currentShift.operatorName}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-base">{currentShift.operatorName}</h3>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                currentShift.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {currentShift.status === 'active' ? 'Active Shift' : 'Shift Closed'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-mono">
              <span>Shift ID: {currentShift.id}</span>
              <span>·</span>
              <span>Started {new Date(currentShift.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <div>
            <span className="text-slate-500 block">Starting Float</span>
            <span className="font-mono text-sm font-bold text-slate-200 tabular-nums">
              {settings.currencySymbol}{currentShift.startingCash.toFixed(2)}
            </span>
          </div>
          <div className="border-l border-slate-800 pl-6">
            <span className="text-slate-500 block">Shift Total Revenue</span>
            <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
              {settings.currencySymbol}{currentShift.totalRevenue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Key Stream Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Stream 1: PC Time */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Terminal Usage Fees</span>
            <Monitor className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
            {settings.currencySymbol}{pcTimeRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalCalculatedRevenue > 0
              ? `${Math.round((pcTimeRevenue / totalCalculatedRevenue) * 100)}% of cafe turnover`
              : '0% share'}
          </div>
        </div>

        {/* Stream 2: Food & Beverage */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Food, Noodles & Drinks</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
            {settings.currencySymbol}{cafeFoodRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalCalculatedRevenue > 0
              ? `${Math.round((cafeFoodRevenue / totalCalculatedRevenue) * 100)}% of cafe turnover`
              : '0% share'}
          </div>
        </div>

        {/* Stream 3: Printing & Retail */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Printing, Scans & Accessories</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {settings.currencySymbol}{printRetailRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalCalculatedRevenue > 0
              ? `${Math.round((printRetailRevenue / totalCalculatedRevenue) * 100)}% of cafe turnover`
              : '0% share'}
          </div>
        </div>

      </div>

      {/* Payment Tender Distribution Strip */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
        <h3 className="font-semibold text-slate-200 text-sm">Shift Revenue by Payment Tender</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Banknote className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cash Tendered</span>
            </div>
            <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
              {settings.currencySymbol}{currentShift.cashRevenue.toFixed(2)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Card Terminals</span>
            </div>
            <div className="text-base font-bold font-mono text-cyan-400 tabular-nums">
              {settings.currencySymbol}{currentShift.cardRevenue.toFixed(2)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span>Member Wallets</span>
            </div>
            <div className="text-base font-bold font-mono text-amber-400 tabular-nums">
              {settings.currencySymbol}{currentShift.walletRevenue.toFixed(2)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>QR / Digital Pay</span>
            </div>
            <div className="text-base font-bold font-mono text-purple-300 tabular-nums">
              {settings.currencySymbol}{currentShift.qrRevenue.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Cash Drawer Balance & Reconciliation Form */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>End-of-Shift Cash Drawer Reconciliation</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify physical cash in drawer against POS expected totals before handoff
            </p>
          </div>
        </div>

        {currentShift.status === 'active' ? (
          <form onSubmit={handleCloseShift} className="space-y-4">
            
            {/* Drawer Math Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Starting Float Cash</span>
                <span className="font-mono text-sm font-semibold text-slate-300 tabular-nums">
                  {settings.currencySymbol}{currentShift.startingCash.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">+ Cash Collected This Shift</span>
                <span className="font-mono text-sm font-semibold text-emerald-400 tabular-nums">
                  +{settings.currencySymbol}{currentShift.cashRevenue.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">= Expected Drawer Cash Total</span>
                <span className="font-mono text-base font-bold text-white tabular-nums">
                  {settings.currencySymbol}{expectedCashInDrawer.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Counted Cash Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Actual Physical Cash Counted in Drawer ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder={expectedCashInDrawer.toFixed(2)}
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-base font-bold px-3 py-2 rounded-lg focus:border-cyan-500 tabular-nums"
                />
              </div>

              {/* Over / Short Live Indicator */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-center">
                <span className="text-[11px] text-slate-400">Drawer Discrepancy (Over / Short)</span>
                {parsedCountedCash > 0 ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`font-mono text-base font-bold tabular-nums ${
                      Math.abs(cashDifference) < 0.01
                        ? 'text-emerald-400'
                        : cashDifference > 0 ? 'text-cyan-400' : 'text-rose-400'
                    }`}>
                      {cashDifference >= 0 ? `+${settings.currencySymbol}${cashDifference.toFixed(2)}` : `-${settings.currencySymbol}${Math.abs(cashDifference).toFixed(2)}`}
                    </span>
                    <span className="text-xs text-slate-400">
                      {Math.abs(cashDifference) < 0.01
                        ? '(Exact match ✓)'
                        : cashDifference > 0 ? '(Drawer Over)' : '(Drawer Short)'}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-600 font-mono mt-1">Enter counted amount</span>
                )}
              </div>
            </div>

            {/* Handover Notes */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Shift Handover Log Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. Station 12 mouse cable replaced; restocking Monster cans needed for night shift..."
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2.5 focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={parsedCountedCash <= 0}
                className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Reconcile Drawer & Close Shift</span>
              </button>
            </div>

          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Shift #{currentShift.id} Successfully Closed</span>
              </div>
              <div className="text-slate-400">
                Counted Cash: <span className="font-mono text-slate-200 font-semibold">${currentShift.actualCashCounted?.toFixed(2)}</span>
                {currentShift.notes && <p className="mt-1 text-slate-400 italic">Notes: {currentShift.notes}</p>}
              </div>
            </div>

            {/* Form to open fresh shift */}
            <form onSubmit={handleStartShift} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
              <h4 className="text-xs font-semibold text-slate-200">Start Next Shift</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Next Shift Operator Name</label>
                  <input
                    type="text"
                    required
                    value={newOperatorName}
                    onChange={(e) => setNewOperatorName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Opening Cash Float ($)</label>
                  <input
                    type="number"
                    step="10"
                    value={newFloat}
                    onChange={(e) => setNewFloat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-3 py-2 font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
              >
                Launch Next Shift
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
};
