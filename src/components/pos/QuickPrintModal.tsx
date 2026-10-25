import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { PaymentMethod } from '../../types';
import { X, Printer, FileText, Scan, Check } from 'lucide-react';

export const QuickPrintModal: React.FC = () => {
  const {
    stations,
    activeModal,
    closeModal,
    recordQuickPrintJob,
    settings,
    openModal
  } = useCyberCafe();

  if (activeModal !== 'quickPrint') return null;

  const [monoPages, setMonoPages] = useState<number>(5);
  const [colorPages, setColorPages] = useState<number>(0);
  const [scanPages, setScanPages] = useState<number>(0);
  const [targetType, setTargetType] = useState<'walkin' | 'station'>('walkin');
  const [stationId, setStationId] = useState<string>(stations.find(s => s.status === 'in_use')?.id || '');
  const [clientName, setClientName] = useState<string>('Print Desk Guest');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const occupiedStations = stations.filter(s => s.status === 'in_use');

  // Rates
  const monoCost = monoPages * settings.monochromePrintRate;
  const colorCost = colorPages * settings.colorPrintRate;
  const scanCost = scanPages * settings.scanRate;
  const subtotal = monoCost + colorCost + scanCost;
  const tax = subtotal * (settings.taxRatePct / 100);
  const grandTotal = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (monoPages === 0 && colorPages === 0 && scanPages === 0) return;

    recordQuickPrintJob({
      monochromePages: monoPages,
      colorPages,
      scanPages,
      targetStationId: targetType === 'station' ? stationId : undefined,
      customerName: clientName.trim() || 'Print Desk Guest',
      paymentMethod
    });

    closeModal();
    if (targetType === 'walkin') {
      openModal('receipt');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Quick Print & Scan Billing</h3>
              <p className="text-xs text-slate-400">Calculate document services and print receipt</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Counters */}
          <div className="space-y-3">
            
            {/* Mono Pages */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">B&W Laser Print / Copy</div>
                  <div className="text-[11px] text-slate-500">
                    {settings.currencySymbol}{settings.monochromePrintRate.toFixed(2)} per page
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={monoPages}
                  onChange={(e) => setMonoPages(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono text-center py-1 rounded focus:outline-hidden focus:border-cyan-500"
                />
                <span className="text-xs font-mono text-slate-400 w-12 text-right">
                  ${monoCost.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Color Pages */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Printer className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Color Laser Print</div>
                  <div className="text-[11px] text-slate-500">
                    {settings.currencySymbol}{settings.colorPrintRate.toFixed(2)} per page
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={colorPages}
                  onChange={(e) => setColorPages(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono text-center py-1 rounded focus:outline-hidden focus:border-cyan-500"
                />
                <span className="text-xs font-mono text-slate-400 w-12 text-right">
                  ${colorCost.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Scans */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Scan className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Optical Document Scan</div>
                  <div className="text-[11px] text-slate-500">
                    {settings.currencySymbol}{settings.scanRate.toFixed(2)} per page
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={scanPages}
                  onChange={(e) => setScanPages(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono text-center py-1 rounded focus:outline-hidden focus:border-cyan-500"
                />
                <span className="text-xs font-mono text-slate-400 w-12 text-right">
                  ${scanCost.toFixed(2)}
                </span>
              </div>
            </div>

          </div>

          {/* Billing Destination */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Charge Destination
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setTargetType('walkin')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                  targetType === 'walkin'
                    ? 'border-cyan-500 bg-cyan-950/20 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                Walk-in Desk Settle
              </button>
              <button
                type="button"
                onClick={() => setTargetType('station')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                  targetType === 'station'
                    ? 'border-cyan-500 bg-cyan-950/20 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                Add to Active Terminal
              </button>
            </div>

            {targetType === 'station' ? (
              occupiedStations.length === 0 ? (
                <p className="text-xs text-rose-400 p-2 bg-rose-950/20 rounded border border-rose-900/40">
                  No terminals are currently active. Settle as walk-in instead.
                </p>
              ) : (
                <select
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2"
                >
                  {occupiedStations.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.currentSession?.customerName})
                    </option>
                  ))}
                </select>
              )
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Client Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2"
                />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit Card</option>
                  <option value="qr_pay">QR Payment</option>
                </select>
              </div>
            )}
          </div>

          {/* Grand Total Summary */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Print Fee (inc. tax)</span>
            <span className="font-mono tabular-nums text-base font-bold text-emerald-400">
              {settings.currencySymbol}{grandTotal.toFixed(2)}
            </span>
          </div>

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
              disabled={subtotal <= 0 || (targetType === 'station' && occupiedStations.length === 0)}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{targetType === 'station' ? 'Attach to Station Tab' : 'Charge & Issue Receipt'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
