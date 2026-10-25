import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import {
  Users,
  Search,
  UserPlus,
  Wallet,
  ShieldCheck,
  Play,
  Sparkles,
  Phone,
  Mail,
  Award
} from 'lucide-react';

export const MembersDirectory: React.FC = () => {
  const {
    members,
    openModal,
    settings
  } = useCyberCafe();

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const filteredMembers = members.filter(m => {
    if (tierFilter !== 'all' && m.tier !== tierFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = m.name.toLowerCase().includes(q);
      const codeMatch = m.memberCode.toLowerCase().includes(q);
      const phoneMatch = m.phone.toLowerCase().includes(q);
      return nameMatch || codeMatch || phoneMatch;
    }
    return true;
  });

  const totalWalletHoldings = members.reduce((sum, m) => sum + m.balance, 0);
  const totalHoursLogged = members.reduce((sum, m) => sum + m.hoursLogged, 0);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'VIP Diamond': return 'text-cyan-400';
      case 'Gold': return 'text-amber-400';
      case 'Silver': return 'text-slate-300';
      default: return 'text-amber-600';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Strip: Member Stats & Add Member */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Registered Members</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {members.length}
            </span>
            <span className="text-xs text-slate-500">accounts</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Active gaming club roster
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Member Wallet Liabilities</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {settings.currencySymbol}{totalWalletHoldings.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Preloaded credit stored in customer wallets
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cumulative Gaming Time</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-300">
              {totalHoursLogged.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">hours logged</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across all competitive tiers
          </div>
        </div>

      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        
        {/* Tier filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['all', 'VIP Diamond', 'Gold', 'Silver', 'Bronze'].map(tier => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                tierFilter === tier
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tier === 'all' ? `All Members (${members.length})` : tier}
            </button>
          ))}
        </div>

        {/* Right side: search & Add member */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, code, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:border-cyan-500 w-full sm:w-56"
            />
          </div>

          <button
            onClick={() => openModal('topup')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-lg transition-colors whitespace-nowrap"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Top-up Wallet</span>
          </button>

          <button
            onClick={() => openModal('member')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Member</span>
          </button>
        </div>

      </div>

      {/* Members Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-medium text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Member ID & Code</th>
                <th className="py-3 px-4">Customer Name & Contacts</th>
                <th className="py-3 px-4">Tier & Discount</th>
                <th className="py-3 px-4 text-right">Wallet Balance</th>
                <th className="py-3 px-4 text-right">Lifetime Spend</th>
                <th className="py-3 px-4 text-right">Hours Logged</th>
                <th className="py-3 px-4 text-center">Joined Date</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  {/* Code */}
                  <td className="py-3 px-4">
                    <span className="font-mono text-cyan-400 font-semibold">
                      {member.memberCode}
                    </span>
                  </td>

                  {/* Name & Contact */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{member.name}</div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span>{member.phone}</span>
                      <span>·</span>
                      <span className="truncate max-w-[140px]">{member.email}</span>
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="py-3 px-4">
                    <div className={`font-semibold ${getTierColor(member.tier)}`}>
                      {member.tier}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {member.discountPct}% station & cafe discount
                    </div>
                  </td>

                  {/* Wallet Balance */}
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    <span className="font-bold text-sm text-emerald-400">
                      {settings.currencySymbol}{member.balance.toFixed(2)}
                    </span>
                  </td>

                  {/* Lifetime Spend */}
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                    {settings.currencySymbol}{member.totalSpent.toFixed(2)}
                  </td>

                  {/* Hours */}
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                    {member.hoursLogged.toFixed(1)} hrs
                  </td>

                  {/* Joined */}
                  <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                    {member.joinedDate}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openModal('topup')}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                      >
                        + Top-up
                      </button>
                      <button
                        onClick={() => openModal('startSession')}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Seat</span>
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
