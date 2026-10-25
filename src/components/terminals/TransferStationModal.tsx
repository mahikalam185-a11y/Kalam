import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { X, ArrowRightLeft, Monitor, Check } from 'lucide-react';

export const TransferStationModal: React.FC = () => {
  const {
    stations,
    selectedStationId,
    activeModal,
    closeModal,
    transferStation
  } = useCyberCafe();

  if (activeModal !== 'transfer' || !selectedStationId) return null;

  const currentStation = stations.find(s => s.id === selectedStationId);
  if (!currentStation || !currentStation.currentSession) return null;

  const availableStations = stations.filter(s => s.status === 'available');

  const [targetStationId, setTargetStationId] = useState<string>(availableStations[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStationId) {
      setErrorMsg('Please select a destination terminal.');
      return;
    }

    const success = transferStation(currentStation.id, targetStationId);
    if (success) {
      closeModal();
    } else {
      setErrorMsg('Failed to transfer station. Please ensure destination is free.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Transfer Active Session</h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTransfer} className="p-6 space-y-4">
          
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <div className="text-slate-400">Current Station:</div>
            <div className="text-slate-200 font-semibold mt-0.5">{currentStation.name}</div>
            <div className="text-slate-400 mt-1">
              Customer: <span className="text-cyan-400">{currentStation.currentSession.customerName}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Select Destination Terminal
            </label>
            {availableStations.length === 0 ? (
              <div className="p-3 text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-lg">
                No destination stations are currently available. Free up another terminal first.
              </div>
            ) : (
              <select
                value={targetStationId}
                onChange={(e) => { setTargetStationId(e.target.value); setErrorMsg(null); }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-cyan-500"
              >
                {availableStations.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (${s.hourlyRate.toFixed(2)}/hr) — {s.specs.gpu}
                  </option>
                ))}
              </select>
            )}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Note: The customer timer, active tab, and food orders will seamlessly migrate to the new terminal. The previous terminal will be flagged for sanitation cleaning.
          </p>

          {errorMsg && (
            <div className="text-xs text-rose-400 bg-rose-950/20 border border-rose-900/40 p-2 rounded">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={availableStations.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Transfer</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
