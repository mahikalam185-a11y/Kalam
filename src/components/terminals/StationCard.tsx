import React from 'react';
import { Station } from '../../types';
import { useCyberCafe } from '../../context/CyberCafeContext';
import {
  Monitor,
  Gamepad2,
  Tv,
  Sparkles,
  Play,
  Pause,
  Clock,
  Coffee,
  CheckCircle2,
  Wrench,
  Receipt,
  ArrowRightLeft
} from 'lucide-react';

interface StationCardProps {
  station: Station;
}

export const StationCard: React.FC<StationCardProps> = ({ station }) => {
  const {
    openModal,
    pauseSession,
    resumeSession,
    setStationStatus,
    calculateLiveBill,
    settings
  } = useCyberCafe();

  const bill = calculateLiveBill(station);
  const session = station.currentSession;

  // Format elapsed time (HH:MM:SS)
  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 360);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format remaining time
  const formatRemainingMinutes = (minutes?: number) => {
    if (minutes === undefined) return null;
    if (minutes < 0) {
      const overMin = Math.abs(minutes);
      return `Overtime +${overMin}m`;
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m left`;
    return `${m}m left`;
  };

  // Status-specific visual accents
  const getStatusStyles = () => {
    switch (station.status) {
      case 'in_use':
        return {
          border: bill.isOverdue ? 'border-rose-500/80 bg-slate-900/90' : 'border-cyan-500/60 bg-slate-900/90 shadow-sm shadow-cyan-950/40',
          badgeText: bill.isOverdue ? 'text-rose-400' : 'text-cyan-400',
          label: bill.isOverdue ? 'Overtime Alert' : 'Active Session'
        };
      case 'paused':
        return {
          border: 'border-amber-500/60 bg-slate-900/70',
          badgeText: 'text-amber-400',
          label: 'Session Paused'
        };
      case 'available':
        return {
          border: 'border-slate-800 hover:border-slate-700 bg-slate-900/40',
          badgeText: 'text-emerald-400',
          label: 'Available'
        };
      case 'cleaning':
        return {
          border: 'border-purple-500/40 bg-slate-900/40',
          badgeText: 'text-purple-400',
          label: 'Needs Sanitizing'
        };
      case 'maintenance':
        return {
          border: 'border-slate-800 bg-slate-950/60 opacity-70',
          badgeText: 'text-slate-500',
          label: 'Maintenance'
        };
    }
  };

  const statusStyle = getStatusStyles();

  // Zone icon
  const getZoneIcon = () => {
    switch (station.zone) {
      case 'esports':
        return <Gamepad2 className="w-4 h-4 text-cyan-400" />;
      case 'vip_booth':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'console_lounge':
        return <Tv className="w-4 h-4 text-emerald-400" />;
      default:
        return <Monitor className="w-4 h-4 text-slate-400" />;
    }
  };

  const getZoneLabel = () => {
    switch (station.zone) {
      case 'esports':
        return 'Esports Pro';
      case 'vip_booth':
        return 'VIP Studio';
      case 'console_lounge':
        return 'Console Lounge';
      default:
        return 'Standard PC';
    }
  };

  return (
    <div className={`flex flex-col justify-between rounded-xl border p-4 transition-all duration-150 ${statusStyle.border}`}>
      
      {/* Top Header Row */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {getZoneIcon()}
            <h3 className="font-semibold text-slate-100 text-sm tracking-tight truncate">
              {station.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span className={statusStyle.badgeText}>{statusStyle.label}</span>
          </div>
        </div>

        {/* Unboxed Metadata: Zone, Rate, Hardware Specs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mb-3">
          <span>{getZoneLabel()}</span>
          <span className="text-slate-600">·</span>
          <span className="font-mono tabular-nums text-slate-300">
            {settings.currencySymbol}{station.hourlyRate.toFixed(2)}/hr
          </span>
          <span className="text-slate-600">·</span>
          <span className="truncate max-w-[140px] text-slate-400" title={station.specs.gpu}>
            {station.specs.gpu}
          </span>
        </div>

        {/* Content Body based on Status */}
        {station.status === 'in_use' && session && (
          <div className="space-y-2 py-2 border-y border-slate-800/80 my-2">
            {/* Customer Details */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Customer</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-slate-200 truncate max-w-[130px]">
                  {session.customerName}
                </span>
                {session.isMember && (
                  <span className="text-[10px] text-cyan-400 font-mono">
                    [{session.memberTier || 'Member'}]
                  </span>
                )}
              </div>
            </div>

            {/* Timer & Duration */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {session.type === 'prepaid' ? 'Remaining' : 'Elapsed'}
              </span>
              <div className="flex items-center gap-2">
                <span className={`font-mono tabular-nums font-semibold ${bill.isOverdue ? 'text-rose-400 animate-pulse' : 'text-cyan-300'}`}>
                  {session.type === 'prepaid' && session.allocatedMinutes
                    ? formatRemainingMinutes(bill.remainingMinutes)
                    : formatSeconds(bill.elapsedSeconds)}
                </span>
                {session.type === 'prepaid' && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({session.allocatedMinutes}m pkg)
                  </span>
                )}
              </div>
            </div>

            {/* Live Bill Ticker */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Running Bill</span>
              <div className="flex items-center gap-1.5">
                {session.orders.length > 0 && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    +{session.orders.length} orders ·
                  </span>
                )}
                <span className="font-mono tabular-nums text-sm font-bold text-emerald-400">
                  {settings.currencySymbol}{bill.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {station.status === 'paused' && session && (
          <div className="space-y-2 py-2 border-y border-slate-800/80 my-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Customer</span>
              <span className="text-slate-200 font-medium">{session.customerName}</span>
            </div>
            <div className="flex items-center justify-between text-amber-300">
              <span>Paused Duration</span>
              <span className="font-mono tabular-nums">
                {Math.floor((session.totalPausedDurationMs || 0) / 60000)}m
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Bill to Date</span>
              <span className="font-mono tabular-nums font-semibold text-emerald-400">
                {settings.currencySymbol}{bill.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {station.status === 'available' && (
          <div className="py-5 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1">
            <Monitor className="w-6 h-6 text-slate-600 mb-1" />
            <span>Ready for guest or member</span>
            <span className="text-[11px] text-slate-600">{station.specs.display}</span>
          </div>
        )}

        {station.status === 'cleaning' && (
          <div className="py-4 text-center text-xs text-purple-400/90 flex flex-col items-center justify-center gap-1.5">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="font-medium">Sanitization In Progress</span>
            <span className="text-slate-500 text-[11px]">Wipe surfaces, clean peripherals</span>
          </div>
        )}

        {station.status === 'maintenance' && (
          <div className="py-4 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1.5">
            <Wrench className="w-5 h-5 text-slate-600" />
            <span>Hardware Diagnostic</span>
            <span className="text-slate-600 text-[11px]">Under maintenance inspection</span>
          </div>
        )}
      </div>

      {/* Action Footer Bar */}
      <div className="pt-3 border-t border-slate-800/60 mt-2">
        {station.status === 'in_use' && (
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => openModal('details', station.id)}
              title="Add food, extend session, or view full details"
              className="px-2 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center justify-center gap-1"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Add</span>
            </button>

            <button
              onClick={() => pauseSession(station.id)}
              title="Pause session timer"
              className="px-2 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center justify-center"
            >
              <Pause className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              onClick={() => openModal('transfer', station.id)}
              title="Transfer to another terminal"
              className="px-2 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center justify-center"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => openModal('checkout', station.id)}
              title="End session and generate receipt"
              className="px-2 py-1.5 text-xs font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center justify-center gap-1 font-semibold"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-950" />
              <span>Bill</span>
            </button>
          </div>
        )}

        {station.status === 'paused' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => resumeSession(station.id)}
              className="w-full py-1.5 px-3 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
            <button
              onClick={() => openModal('checkout', station.id)}
              className="w-full py-1.5 px-3 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Settle Bill</span>
            </button>
          </div>
        )}

        {station.status === 'available' && (
          <button
            onClick={() => openModal('startSession', station.id)}
            className="w-full py-2 px-3 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Session</span>
          </button>
        )}

        {station.status === 'cleaning' && (
          <button
            onClick={() => setStationStatus(station.id, 'available')}
            className="w-full py-1.5 px-3 text-xs font-semibold text-purple-300 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 rounded flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Ready & Available</span>
          </button>
        )}

        {station.status === 'maintenance' && (
          <button
            onClick={() => setStationStatus(station.id, 'available')}
            className="w-full py-1.5 px-3 text-xs font-medium text-slate-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Reactivate Terminal</span>
          </button>
        )}
      </div>

    </div>
  );
};
