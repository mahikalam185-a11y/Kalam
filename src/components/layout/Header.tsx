import React, { useState } from 'react';
import { useCyberCafe, AppTab } from '../../context/CyberCafeContext';
import {
  FileText,
  CreditCard,
  BookOpen,
  ShoppingBag,
  Clock,
  Settings,
  Plus,
  ShieldCheck,
  Globe,
  Lock,
  Unlock,
  KeyRound,
  Phone,
  MapPin,
  UserCheck,
  Share2,
  QrCode,
  Copy,
  Check,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    serviceOrders,
    khataCustomers,
    settings,
    currentTime,
    activeTab,
    setActiveTab,
    openModal,
    isAdminAuthenticated,
    logoutAdmin
  } = useCyberCafe();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeOrdersCount = serviceOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const totalMarketDue = khataCustomers.reduce((sum, c) => sum + c.totalDue, 0);

  const timeString = new Date(currentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = new Date(currentTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const adminOnlyTabs: AppTab[] = ['orders', 'pos', 'khata', 'ledger', 'settings'];

  // In public service mode, Khata and admin management tabs are completely OUT!
  const navItems: { tab: AppTab; label: string; icon: React.ReactNode; badgeCount?: number; badgeColor?: string }[] = isAdminAuthenticated ? [
    { tab: 'orders', label: 'Seva Orders / কাজ', icon: <FileText className="w-4 h-4" />, badgeCount: activeOrdersCount },
    { tab: 'pos', label: 'Xerox & POS / প্রিন্ট', icon: <ShoppingBag className="w-4 h-4" /> },
    { tab: 'ratechart', label: 'Rate Chart / রেট চার্ট', icon: <CreditCard className="w-4 h-4" /> },
    { tab: 'khata', label: 'Digital Khata / খাতা', icon: <BookOpen className="w-4 h-4" />, badgeCount: totalMarketDue > 0 ? Math.round(totalMarketDue) : undefined },
    { tab: 'portal', label: 'Citizen Portal / অনলাইন সেবা', icon: <Globe className="w-4 h-4 text-emerald-400" /> },
    { tab: 'ledger', label: 'Ledger Receipts', icon: <Clock className="w-4 h-4" /> },
    { tab: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ] : [
    { tab: 'portal', label: 'Citizen Portal / অনলাইন সেবা', icon: <Globe className="w-4 h-4 text-emerald-400" /> },
    { tab: 'ratechart', label: 'Rate Chart / রেট চার্ট', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const portalUrl = typeof window !== 'undefined' ? window.location.href : 'https://afrina-cyber-cafe.com';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-30 shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          
          {/* Brand Wordmark: AFRINA INTERNET CAFE */}
          <div 
            onClick={() => setActiveTab(isAdminAuthenticated ? 'orders' : 'portal')}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase whitespace-nowrap">
                  AFRINA <span className="text-cyan-400 font-extrabold">INTERNET CAFE</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  CSC Seva
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[200px] sm:max-w-none">
                BALI HATPARA NOWDA MSD 741156 · 8609550430
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
            {navItems.map(item => {
              const isActive = activeTab === item.tab;
              const isLocked = !isAdminAuthenticated && adminOnlyTabs.includes(item.tab);

              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700/80 shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {isLocked && (
                    <Lock className="w-3 h-3 text-amber-400 shrink-0 ml-0.5" />
                  )}
                  {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                    <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                      {item.tab === 'khata' ? `₹${item.badgeCount}` : item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster: Share/Publish, Admin Status & New Order */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Share / Publish Citizen Portal Button */}
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 transition-all cursor-pointer shadow-xs"
              title="Publish & Share Citizen Portal Link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Publish / পোর্টাল শেয়ার</span>
            </button>

            {/* Operator Abu Kalam Sheikh Status & Toggle */}
            {isAdminAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin: Abu Kalam</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logoutAdmin();
                    setActiveTab('portal');
                  }}
                  title="Lock Admin Khata & Orders"
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-900/80 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock (লক)</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                    : 'bg-amber-950/50 hover:bg-amber-900/70 text-amber-300 border-amber-700/80'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Operator Login</span>
              </button>
            )}

            {/* Primary Action: + New Kaj for admin, Apply Online for customers */}
            {isAdminAuthenticated ? (
              <button
                onClick={() => openModal('newOrder')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-lg transition-all whitespace-nowrap shrink-0 shadow-sm shadow-cyan-400/25 active:scale-98 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">+ New Kaj / কাজ</span>
                <span className="sm:hidden">+ Kaj</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('portal');
                  window.scrollTo({ top: 320, behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 rounded-lg transition-all whitespace-nowrap shrink-0 shadow-sm shadow-emerald-400/25 active:scale-98 cursor-pointer"
              >
                <FileText className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Apply Online / আবেদন করুন</span>
                <span className="sm:hidden">Apply</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation Row (underneath 1st row on small screens) */}
        <div className="flex lg:hidden items-center gap-1 overflow-x-auto scrollbar-none py-2 border-t border-slate-800/80">
          {navItems.map(item => {
            const isActive = activeTab === item.tab;
            const isLocked = !isAdminAuthenticated && adminOnlyTabs.includes(item.tab);
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {isLocked && <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-bar: Shop Contact, Address, Operator & Market Due */}
      <div className="bg-slate-900/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-slate-400 gap-y-1.5 gap-x-4">
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1 text-slate-200 font-semibold">
              <span className="text-cyan-400 font-bold uppercase">AFRINA INTERNET CAFE</span>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span className="font-mono font-bold text-white">8609550430</span>
            </div>

            <div className="hidden md:flex items-center gap-1 text-slate-400">
              <MapPin className="w-3 h-3 text-rose-400" />
              <span>BALI HATPARA NOWDA MSD 741156</span>
            </div>

            {isAdminAuthenticated && activeTab !== 'portal' ? (
              <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-slate-800">
                <span className="text-slate-400 font-medium">Khata Due (বাকি):</span>
                <span className="font-mono font-bold text-rose-400 tabular-nums">
                  {settings.currencySymbol}{totalMarketDue.toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-slate-800 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-medium text-emerald-300">Public Citizen Service (অনলাইন সেবা পোর্টাল)</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-500">Operator:</span>
              <span className="text-cyan-300 font-semibold">ABU KALAM SHEIKH</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 font-mono tabular-nums text-slate-300">
              <span className="text-slate-500">{dateString}</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 font-semibold">{timeString}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Share / Publish Portal Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">
                  Publish & Share Citizen Portal (পাবলিক সেবা পোর্টাল)
                </h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Share this live portal link or QR code with customers in <strong className="text-white">Bali Hatpara, Nowda</strong> so they can view rate charts, apply for PAN/Voter/LL from home, and upload documents:
            </p>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(portalUrl)}`}
                  alt="Citizen Portal QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Scan with Phone Camera to open Portal</span>
            </div>

            {/* Link Copy Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 block font-medium">Public Portal URL:</label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={portalUrl}
                  className="bg-transparent text-xs text-cyan-300 font-mono flex-1 outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Admin protection: <strong className="text-emerald-400">Enabled</strong> (Khata is private)</span>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
