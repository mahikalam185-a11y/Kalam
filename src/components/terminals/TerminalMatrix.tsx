import React, { useState, useMemo } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { StationZone, StationStatus } from '../../types';
import { StationCard } from './StationCard';
import {
  Search,
  Filter,
  Monitor,
  Gamepad2,
  Tv,
  Sparkles,
  Printer,
  ShoppingBag,
  Plus,
  Zap,
  TrendingUp
} from 'lucide-react';

export const TerminalMatrix: React.FC = () => {
  const {
    stations,
    openModal,
    settings
  } = useCyberCafe();

  const [zoneFilter, setZoneFilter] = useState<'all' | StationZone>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | StationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered stations
  const filteredStations = useMemo(() => {
    return stations.filter(station => {
      // Zone match
      if (zoneFilter !== 'all' && station.zone !== zoneFilter) {
        return false;
      }
      // Status match
      if (statusFilter !== 'all' && station.status !== statusFilter) {
        return false;
      }
      // Search query (name, customer name, specs)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = station.name.toLowerCase().includes(query);
        const idMatch = station.id.toLowerCase().includes(query);
        const customerMatch = station.currentSession?.customerName.toLowerCase().includes(query) || false;
        const gpuMatch = station.specs.gpu.toLowerCase().includes(query);
        if (!nameMatch && !idMatch && !customerMatch && !gpuMatch) {
          return false;
        }
      }
      return true;
    });
  }, [stations, zoneFilter, statusFilter, searchQuery]);

  // Aggregate stats
  const activeCount = stations.filter(s => s.status === 'in_use').length;
  const availableCount = stations.filter(s => s.status === 'available').length;
  const currentHourlyBurn = stations
    .filter(s => s.status === 'in_use')
    .reduce((sum, s) => sum + s.hourlyRate, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Controls: KPI bar & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Terminals */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Live Terminals</span>
            <Monitor className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {activeCount}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              / {stations.length} total ({Math.round((activeCount / stations.length) * 100)}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>{availableCount} available right now</span>
          </div>
        </div>

        {/* KPI 2: Live Hourly Run-Rate */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Current Floor Run-Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {settings.currencySymbol}{currentHourlyBurn.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">/ hr active</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>From currently seated guests</span>
          </div>
        </div>

        {/* Action 1: Print Desk Calculator */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Print & Scan Desk</span>
            <Printer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xs text-slate-300">
            Rapid calculator for B&W, color laser, & scans
          </div>
          <button
            onClick={() => openModal('quickPrint')}
            className="mt-2.5 w-full py-1.5 px-3 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Launch Print Billing</span>
          </button>
        </div>

        {/* Action 2: Direct Cafe POS checkout */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cafe Express POS</span>
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xs text-slate-300">
            Walk-in drinks, instant noodles & snacks
          </div>
          <button
            onClick={() => openModal('inventory')}
            className="mt-2.5 w-full py-1.5 px-3 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Restock / Stock Status</span>
          </button>
        </div>

      </div>

      {/* Filter Toolbar: Zone Segmented Controls, Status, Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
        
        {/* Zone Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setZoneFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              zoneFilter === 'all'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            All Zones ({stations.length})
          </button>
          <button
            onClick={() => setZoneFilter('esports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              zoneFilter === 'esports'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Esports Arena (4)</span>
          </button>
          <button
            onClick={() => setZoneFilter('standard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              zoneFilter === 'standard'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Standard Battle (8)</span>
          </button>
          <button
            onClick={() => setZoneFilter('vip_booth')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              zoneFilter === 'vip_booth'
                ? 'bg-slate-800 text-amber-300 border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>VIP Booths (2)</span>
          </button>
          <button
            onClick={() => setZoneFilter('console_lounge')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              zoneFilter === 'console_lounge'
                ? 'bg-slate-800 text-emerald-300 border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Console Lounge (2)</span>
          </button>
        </div>

        {/* Right side: Status filter & Search bar */}
        <div className="flex items-center gap-2">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available Only</option>
              <option value="in_use">In Use / Seated</option>
              <option value="paused">Paused</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search PC, customer, GPU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500"
            />
          </div>
        </div>

      </div>

      {/* Terminal Cards Grid */}
      {filteredStations.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-center">
          <Monitor className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-slate-300 font-medium text-sm">No Stations Match Current Filter</h4>
          <p className="text-slate-500 text-xs mt-1">Try resetting the zone or search term.</p>
          <button
            onClick={() => { setZoneFilter('all'); setStatusFilter('all'); setSearchQuery(''); }}
            className="mt-3 px-3 py-1.5 text-xs text-cyan-400 bg-slate-800 hover:bg-slate-700 rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStations.map(station => (
            <StationCard key={station.id} station={station} />
          ))}
        </div>
      )}

    </div>
  );
};
