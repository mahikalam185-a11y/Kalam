import React, { useState, useEffect } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { SessionType } from '../../types';
import { X, Play, Clock, User, ShieldCheck, Check } from 'lucide-react';

export const StartSessionModal: React.FC = () => {
  const {
    stations,
    members,
    selectedStationId,
    activeModal,
    closeModal,
    startSession,
    settings
  } = useCyberCafe();

  if (activeModal !== 'startSession') return null;

  const availableStations = stations.filter(s => s.status === 'available');

  const [stationId, setStationId] = useState<string>(() => {
    if (selectedStationId && stations.some(s => s.id === selectedStationId && s.status === 'available')) {
      return selectedStationId;
    }
    return availableStations[0]?.id || '';
  });

  const [customerMode, setCustomerMode] = useState<'guest' | 'member'>('guest');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [sessionType, setSessionType] = useState<SessionType>('open');
  const [prepaidMinutes, setPrepaidMinutes] = useState<number>(120);
  const [notes, setNotes] = useState('');

  // Find target station
  const targetStation = stations.find(s => s.id === stationId);
  const selectedMember = members.find(m => m.id === selectedMemberId);

  // Quick package options
  const PREPAID_PACKAGES = [
    { label: '1 Hour', minutes: 60 },
    { label: '2 Hours', minutes: 120 },
    { label: '3 Hours', minutes: 180 },
    { label: '5 Hours', minutes: 300 },
    { label: 'Night Pass (6h)', minutes: 360 }
  ];

  // Calculate estimated initial price
  const hourlyRate = targetStation?.hourlyRate || 3.50;
  const discountPct = customerMode === 'member' && selectedMember ? selectedMember.discountPct : 0;

  const estimatedTimeCost = sessionType === 'prepaid'
    ? (prepaidMinutes / 60) * hourlyRate
    : hourlyRate; // 1 hour estimate for open

  const discountAmount = estimatedTimeCost * (discountPct / 100);
  const taxable = estimatedTimeCost - discountAmount;
  const estimatedTax = taxable * (settings.taxRatePct / 100);
  const estimatedTotal = taxable + estimatedTax;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationId) return;

    const customerName = customerMode === 'member' && selectedMember
      ? selectedMember.name
      : (guestName.trim() || 'Walk-in Guest');

    const customerPhone = customerMode === 'member' && selectedMember
      ? selectedMember.phone
      : guestPhone.trim();

    startSession(stationId, {
      customerName,
      customerPhone,
      memberId: customerMode === 'member' ? selectedMemberId : undefined,
      type: sessionType,
      allocatedMinutes: sessionType === 'prepaid' ? prepaidMinutes : undefined,
      notes: notes.trim()
    });

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Start New Station Session</h3>
              <p className="text-xs text-slate-400">Initialize terminal timer & assign customer tab</p>
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
        <form onSubmit={handleStart} className="p-6 space-y-4">
          
          {/* Station Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Select Available Terminal
            </label>
            {availableStations.length === 0 ? (
              <div className="p-3 text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-lg">
                No terminals currently available. Please check out or sanitize a station first.
              </div>
            ) : (
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-hidden focus:border-cyan-500"
              >
                {availableStations.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.specs.gpu} (${s.hourlyRate.toFixed(2)}/hr)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Customer Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Customer Classification
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setCustomerMode('guest')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                  customerMode === 'guest'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Walk-in Guest
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('member')}
                className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  customerMode === 'member'
                    ? 'bg-slate-800 text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Registered Member</span>
              </button>
            </div>
          </div>

          {/* Guest or Member Fields */}
          {customerMode === 'guest' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Guest Name / Handle</label>
                <input
                  type="text"
                  placeholder="e.g. Mike Ross"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Select Member Account</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-hidden focus:border-cyan-500"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.memberCode}) — {m.tier} ({m.discountPct}% off) · Bal: ${m.balance.toFixed(2)}
                  </option>
                ))}
              </select>
              {selectedMember && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs flex items-center justify-between">
                  <div className="text-slate-300">
                    <span className="font-medium text-cyan-400">{selectedMember.tier}</span>
                    <span className="text-slate-500 mx-1.5">·</span>
                    <span>{selectedMember.discountPct}% discount active</span>
                  </div>
                  <div className="font-mono text-emerald-400 font-medium">
                    Wallet: ${selectedMember.balance.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Session Type: Open vs Prepaid */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Billing Package
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setSessionType('open')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  sessionType === 'open'
                    ? 'border-cyan-500 bg-cyan-950/20 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold text-slate-200">Open Pay-as-You-Go</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Calculates per minute until checkout</div>
              </button>

              <button
                type="button"
                onClick={() => setSessionType('prepaid')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  sessionType === 'prepaid'
                    ? 'border-cyan-500 bg-cyan-950/20 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold text-slate-200">Prepaid Time Package</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Fixed duration with countdown alert</div>
              </button>
            </div>

            {/* Prepaid Options */}
            {sessionType === 'prepaid' && (
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {PREPAID_PACKAGES.map(pkg => (
                  <button
                    key={pkg.minutes}
                    type="button"
                    onClick={() => setPrepaidMinutes(pkg.minutes)}
                    className={`py-1.5 px-2 text-xs font-mono rounded-lg border transition-colors ${
                      prepaidMinutes === pkg.minutes
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-semibold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pkg.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Session Memo / Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Scrim match, requested 2nd controller..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          {/* Estimated Summary */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div className="text-slate-400">
              <span>Rate: {settings.currencySymbol}{hourlyRate.toFixed(2)}/hr</span>
              {discountPct > 0 && <span className="text-cyan-400 ml-1.5">({discountPct}% off)</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">
                {sessionType === 'prepaid' ? 'Prepaid Cost:' : 'Est. 1st Hour:'}
              </span>
              <span className="font-mono tabular-nums text-sm font-bold text-emerald-400">
                {settings.currencySymbol}{estimatedTotal.toFixed(2)}
              </span>
            </div>
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
              disabled={availableStations.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Terminal Session</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
