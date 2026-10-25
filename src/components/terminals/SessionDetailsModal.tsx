import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import {
  X,
  Plus,
  Clock,
  Coffee,
  Receipt,
  Pause,
  Play,
  ArrowRightLeft,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const SessionDetailsModal: React.FC = () => {
  const {
    stations,
    products,
    selectedStationId,
    activeModal,
    closeModal,
    openModal,
    pauseSession,
    resumeSession,
    extendSession,
    addOrderToStation,
    calculateLiveBill,
    settings
  } = useCyberCafe();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [addOrderSuccess, setAddOrderSuccess] = useState(false);

  if (activeModal !== 'details' || !selectedStationId) return null;

  const station = stations.find(s => s.id === selectedStationId);
  if (!station || !station.currentSession) return null;

  const session = station.currentSession;
  const bill = calculateLiveBill(station);

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || orderQuantity < 1) return;

    addOrderToStation(station.id, [{ productId: selectedProductId, quantity: orderQuantity }]);
    setAddOrderSuccess(true);
    setTimeout(() => setAddOrderSuccess(false), 2000);
    setOrderQuantity(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-sm">{station.name}</h3>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                station.status === 'in_use' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {station.status === 'in_use' ? 'Active' : 'Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer: <span className="text-slate-200 font-medium">{session.customerName}</span>
              {session.isMember && <span className="text-cyan-400 font-mono ml-1.5">[{session.memberTier} Member]</span>}
              {session.customerPhone && <span className="text-slate-500 ml-1.5">· {session.customerPhone}</span>}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Real-time Telemetry strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-[11px] text-slate-500">Session Mode</div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5 capitalize">
                {session.type} ({session.type === 'prepaid' ? `${session.allocatedMinutes}m` : 'Pay/min'})
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Active Duration</div>
              <div className="font-mono text-sm font-bold text-cyan-400 mt-0.5 tabular-nums">
                {formatSeconds(bill.elapsedSeconds)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">
                {session.type === 'prepaid' ? 'Remaining Time' : 'Hourly Rate'}
              </div>
              <div className={`font-mono text-xs font-semibold mt-0.5 tabular-nums ${
                bill.isOverdue ? 'text-rose-400' : 'text-slate-200'
              }`}>
                {session.type === 'prepaid'
                  ? (bill.isOverdue ? `Overdue ${Math.abs(bill.remainingMinutes || 0)}m` : `${bill.remainingMinutes}m remaining`)
                  : `${settings.currencySymbol}${station.hourlyRate.toFixed(2)}/hr`}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Live Running Total</div>
              <div className="font-mono text-sm font-bold text-emerald-400 mt-0.5 tabular-nums">
                {settings.currencySymbol}{bill.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Quick Extend Controls (if prepaid) */}
          <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">Quick Extend Time</span>
              <span className="text-[11px] text-slate-500">Add prepaid duration to timer</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 60, 120].map(mins => (
                <button
                  key={mins}
                  onClick={() => extendSession(station.id, mins)}
                  className="py-1.5 px-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded transition-colors border border-slate-700/60"
                >
                  +{mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Add Snacks / Drinks / Printing directly to bill */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h4 className="text-xs font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>Add Cafe Order / Print Job to Station Tab</span>
            </h4>
            
            <form onSubmit={handleAddProduct} className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <label className="block text-[11px] text-slate-400 mb-1">Select Item</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-hidden focus:border-cyan-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                      {p.name} — ${p.price.toFixed(2)} ({p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24">
                <label className="block text-[11px] text-slate-400 mb-1">Qty</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 text-center focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add to Tab</span>
              </button>
            </form>

            {addOrderSuccess && (
              <div className="mt-2 text-xs text-emerald-400 animate-in fade-in">
                ✓ Order added to running bill!
              </div>
            )}
          </div>

          {/* Current Orders List */}
          <div>
            <h4 className="text-xs font-medium text-slate-400 mb-2">Itemized Orders on This Station</h4>
            {session.orders.length === 0 ? (
              <p className="text-xs text-slate-600 italic py-2">No drinks or snacks added yet.</p>
            ) : (
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
                {session.orders.map((order, idx) => (
                  <div key={order.id || idx} className="flex items-center justify-between px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-medium">{order.name}</span>
                      <span className="text-slate-500 font-mono">× {order.quantity}</span>
                    </div>
                    <span className="font-mono tabular-nums text-slate-200">
                      {settings.currencySymbol}{(order.price * order.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bill breakdown summary */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>PC Time Charge ({bill.durationMinutes} mins)</span>
              <span className="font-mono tabular-nums text-slate-300">
                {settings.currencySymbol}{bill.timeCharge.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cafe Orders & Print Tab</span>
              <span className="font-mono tabular-nums text-slate-300">
                {settings.currencySymbol}{bill.ordersCharge.toFixed(2)}
              </span>
            </div>
            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-cyan-400">
                <span>Member Discount ({session.discountPct}%)</span>
                <span className="font-mono tabular-nums">
                  -{settings.currencySymbol}{bill.discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Tax ({settings.taxRatePct}%)</span>
              <span className="font-mono tabular-nums text-slate-300">
                {settings.currencySymbol}{bill.taxAmount.toFixed(2)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-semibold text-white">
              <span>Grand Total</span>
              <span className="font-mono tabular-nums text-emerald-400">
                {settings.currencySymbol}{bill.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            {station.status === 'in_use' ? (
              <button
                onClick={() => pauseSession(station.id)}
                className="px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-800/60 hover:bg-amber-900/60 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={() => resumeSession(station.id)}
                className="px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 hover:bg-cyan-900/60 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
            )}

            <button
              onClick={() => openModal('transfer', station.id)}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer PC</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={closeModal}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => openModal('checkout', station.id)}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Receipt className="w-4 h-4 text-slate-950" />
              <span>Checkout & Settle Bill</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
