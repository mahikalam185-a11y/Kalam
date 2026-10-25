import React from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import {
  ShieldCheck,
  BookOpen,
  ShoppingBag,
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Lock,
  Globe,
  PlusCircle,
  Clock,
  Package
} from 'lucide-react';

export const AdminHeaderBanner: React.FC = () => {
  const {
    isAdminAuthenticated,
    settings,
    activeTab,
    setActiveTab,
    serviceOrders,
    khataCustomers,
    currentShift,
    openModal,
    logoutAdmin
  } = useCyberCafe();

  if (!isAdminAuthenticated) return null;

  const totalMarketDue = khataCustomers.reduce((acc, c) => acc + (c.totalDue || 0), 0);
  const activeOrders = serviceOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

  return (
    <div className="mb-6 rounded-2xl border border-cyan-800/60 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 p-4 sm:p-5 shadow-2xl relative overflow-hidden animate-in fade-in">
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        
        {/* Top line: Operator identity and Lock */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-400/20">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-white tracking-tight uppercase">
                  {settings.cafeName}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                  Admin Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Operator: <span className="text-cyan-300 font-semibold">ABU KALAM SHEIKH</span> · 8609550430 · Bali Hatpara Nowda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('portal')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Preview Customer Side Portal"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Customer Portal (পাবলিক ভিউ)</span>
            </button>

            <button
              onClick={() => {
                logoutAdmin();
                setActiveTab('portal');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 transition-colors cursor-pointer"
              title="Lock and Return to Public View"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock (লক)</span>
            </button>
          </div>
        </div>

        {/* Middle Stats Pulse: Khata Due, Shift Sales, Orders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* 1. Digital Khata Stat */}
          <div 
            onClick={() => setActiveTab('khata')}
            className={`p-3 rounded-xl border transition-all cursor-pointer group ${
              activeTab === 'khata'
                ? 'bg-rose-950/50 border-rose-700/80 shadow-md'
                : 'bg-slate-900/80 border-slate-800 hover:border-rose-800/70'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold text-rose-300">
                <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                <span>Digital Khata (মার্কেট বাকি)</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-rose-300 transition-colors" />
            </div>
            <div className="text-lg font-black font-mono text-rose-400">
              {settings.currencySymbol}{totalMarketDue.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {khataCustomers.length} জন কাস্টমারের বাকি খাতা
            </p>
          </div>

          {/* 2. Today's Shift Collection */}
          <div 
            onClick={() => setActiveTab('pos')}
            className={`p-3 rounded-xl border transition-all cursor-pointer group ${
              activeTab === 'pos'
                ? 'bg-cyan-950/50 border-cyan-700/80 shadow-md'
                : 'bg-slate-900/80 border-slate-800 hover:border-cyan-800/70'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold text-cyan-300">
                <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                <span>Xerox POS & Stock Sales</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-300 transition-colors" />
            </div>
            <div className="text-lg font-black font-mono text-emerald-400">
              {settings.currencySymbol}{(currentShift.totalRevenue || 0).toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              ক্যাশ ও UPI সরাসরি রেজিস্টার
            </p>
          </div>

          {/* 3. Pending Seva Orders */}
          <div 
            onClick={() => setActiveTab('orders')}
            className={`p-3 rounded-xl border transition-all cursor-pointer group ${
              activeTab === 'orders'
                ? 'bg-emerald-950/50 border-emerald-700/80 shadow-md'
                : 'bg-slate-900/80 border-slate-800 hover:border-emerald-800/70'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold text-emerald-300">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active Seva Orders (কাজ)</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-300 transition-colors" />
            </div>
            <div className="text-lg font-black font-mono text-white">
              {activeOrders.length} <span className="text-xs text-slate-400 font-normal">টি অর্ডার চলমান</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              PAN, ভোটার, আধার ও লাইসেন্স
            </p>
          </div>

        </div>

        {/* Quick Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Actions:</span>

          <button
            onClick={() => openModal('newOrder')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ New Order / কাজ</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Xerox POS & Billing</span>
          </button>

          <button
            onClick={() => setActiveTab('khata')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Digital Khata (খাতা)</span>
          </button>

          <button
            onClick={() => setActiveTab('ratechart')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Rate Chart (রেট চার্ট)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
