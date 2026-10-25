import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import {
  Clock,
  Coffee,
  Receipt,
  ArrowRightLeft,
  Search,
  Plus,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';

export const ActiveSessionsTable: React.FC = () => {
  const {
    stations,
    openModal,
    pauseSession,
    resumeSession,
    calculateLiveBill,
    settings
  } = useCyberCafe();

  const [search, setSearch] = useState('');

  // Active or paused sessions
  const activeStations = stations.filter(s => s.status === 'in_use' || s.status === 'paused');

  const filtered = activeStations.filter(station => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameMatch = station.name.toLowerCase().includes(q);
    const custMatch = station.currentSession?.customerName.toLowerCase().includes(q) || false;
    return nameMatch || custMatch;
  });

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Active Terminal Sessions</span>
            <span className="text-xs font-mono font-normal text-slate-400 ml-1">
              ({activeStations.length} live)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time duration tracking, order totals, and instant checkout console
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter customer or station..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-hidden focus:border-cyan-500 w-full sm:w-56"
            />
          </div>
          <button
            onClick={() => openModal('startSession')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-center">
          <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-slate-300 font-medium text-sm">No Active Terminal Sessions Found</h4>
          <p className="text-slate-500 text-xs mt-1">
            {activeStations.length === 0
              ? 'All stations are currently idle. Launch a new session for incoming guests.'
              : 'No sessions match your search query.'}
          </p>
          <button
            onClick={() => openModal('startSession')}
            className="mt-3 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start Session</span>
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-medium text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Customer & Tier</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Duration / Remaining</th>
                  <th className="py-3 px-4 text-right">Time Fee</th>
                  <th className="py-3 px-4 text-right">Orders Tab</th>
                  <th className="py-3 px-4 text-right">Running Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map(station => {
                  const session = station.currentSession!;
                  const bill = calculateLiveBill(station);
                  const isPrepaid = session.type === 'prepaid';

                  return (
                    <tr key={station.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Station */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{station.name}</div>
                        <div className="text-[11px] text-slate-500">{station.specs.gpu}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200 flex items-center gap-1.5">
                          <span>{session.customerName}</span>
                          {session.isMember && (
                            <span className="text-[10px] text-cyan-400 font-mono">
                              [{session.memberTier}]
                            </span>
                          )}
                        </div>
                        {session.customerPhone && (
                          <div className="text-[11px] text-slate-500 font-mono">{session.customerPhone}</div>
                        )}
                      </td>

                      {/* Package */}
                      <td className="py-3 px-4">
                        <span className="capitalize text-slate-300 font-medium">
                          {session.type}
                        </span>
                        {isPrepaid && (
                          <span className="text-[11px] text-slate-500 ml-1 font-mono">
                            ({session.allocatedMinutes}m)
                          </span>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono">
                          {settings.currencySymbol}{station.hourlyRate.toFixed(2)}/hr
                        </div>
                      </td>

                      {/* Duration / Timer */}
                      <td className="py-3 px-4 font-mono tabular-nums">
                        <div className="font-semibold text-cyan-300">
                          {formatSeconds(bill.elapsedSeconds)}
                        </div>
                        {isPrepaid && (
                          <div className={`text-[11px] ${bill.isOverdue ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-400'}`}>
                            {bill.isOverdue
                              ? `Overtime +${Math.abs(bill.remainingMinutes || 0)}m`
                              : `${bill.remainingMinutes}m left`}
                          </div>
                        )}
                      </td>

                      {/* Time Fee */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                        {settings.currencySymbol}{bill.timeCharge.toFixed(2)}
                      </td>

                      {/* Orders Tab */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {session.orders.length > 0 ? (
                          <div>
                            <span className="text-slate-300 font-medium">
                              {settings.currencySymbol}{bill.ordersCharge.toFixed(2)}
                            </span>
                            <div className="text-[10px] text-slate-500">
                              {session.orders.length} item{session.orders.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Running Total */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        <span className="font-bold text-sm text-emerald-400">
                          {settings.currencySymbol}{bill.totalAmount.toFixed(2)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                          station.status === 'in_use'
                            ? (bill.isOverdue ? 'bg-rose-950/60 text-rose-300 border border-rose-800' : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800')
                            : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                        }`}>
                          {station.status === 'in_use' ? (bill.isOverdue ? 'OVERTIME' : 'ACTIVE') : 'PAUSED'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openModal('details', station.id)}
                            title="Add food or view details"
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Coffee className="w-4 h-4 text-amber-400" />
                          </button>

                          {station.status === 'in_use' ? (
                            <button
                              onClick={() => pauseSession(station.id)}
                              title="Pause Session"
                              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                            >
                              <Pause className="w-4 h-4 text-amber-400" />
                            </button>
                          ) : (
                            <button
                              onClick={() => resumeSession(station.id)}
                              title="Resume Session"
                              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                            >
                              <Play className="w-4 h-4 text-cyan-400" />
                            </button>
                          )}

                          <button
                            onClick={() => openModal('transfer', station.id)}
                            title="Transfer PC"
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                          >
                            <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                          </button>

                          <button
                            onClick={() => openModal('checkout', station.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Checkout</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
