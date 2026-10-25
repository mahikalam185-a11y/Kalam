import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { KhataTransaction } from '../../types';
import {
  BookOpen,
  Search,
  UserPlus,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Share2,
  Phone,
  MapPin,
  AlertCircle,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  Lock,
  Unlock,
  Shield,
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';

export const KhataView: React.FC = () => {
  const {
    khataCustomers,
    khataTransactions,
    selectedKhataCustomerId,
    setSelectedKhataCustomerId,
    openModal,
    deleteKhataCustomer,
    deleteKhataEntry,
    setSelectedKhataTransaction,
    isAdminAuthenticated,
    adminPin,
    loginAdmin,
    logoutAdmin,
    settings
  } = useCyberCafe();

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'due_only'>('all');
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin PIN input state when locked
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Deletion modals state
  const [customerToDelete, setCustomerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<KhataTransaction | null>(null);

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const success = loginAdmin(enteredPin);
    if (success) {
      setEnteredPin('');
      setPinError(false);
      setToastMessage('✓ Admin Access Unlocked. Digital Khata is now accessible.');
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (enteredPin.length < 6) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      if (nextPin.length === 4) {
        const success = loginAdmin(nextPin);
        if (success) {
          setEnteredPin('');
          setPinError(false);
          setToastMessage('✓ Admin Unlocked. Digital Khata accessible.');
          setTimeout(() => setToastMessage(null), 3000);
        }
      }
    }
  };

  // Filter customers
  const filteredCustomers = khataCustomers.filter(c => {
    if (filterMode === 'due_only' && c.totalDue <= 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = c.name.toLowerCase().includes(q);
      const phoneMatch = c.phone.toLowerCase().includes(q);
      const villageMatch = c.village.toLowerCase().includes(q);
      return nameMatch || phoneMatch || villageMatch;
    }
    return true;
  });

  // Active selected customer
  const activeCustomer = khataCustomers.find(c => c.id === selectedKhataCustomerId) || filteredCustomers[0];

  // Transactions for selected customer
  const customerTransactions = khataTransactions
    .filter(t => t.customerId === activeCustomer?.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  // Overall aggregates
  const totalMarketDue = khataCustomers.reduce((sum, c) => sum + c.totalDue, 0);
  const totalDueCustomers = khataCustomers.filter(c => c.totalDue > 0).length;

  const handleCopyWhatsApp = () => {
    if (!activeCustomer) return;
    const msg = `Namaskar ${activeCustomer.name},\nThis is a friendly reminder from ${settings.cafeName}.\nYour pending balance in our Digital Khata is: ${settings.currencySymbol}${activeCustomer.totalDue.toFixed(2)}.\nPlease visit to settle during your next visit.\nThank you!`;
    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleConfirmDeleteCustomer = () => {
    if (!customerToDelete) return;
    deleteKhataCustomer(customerToDelete.id);
    setCustomerToDelete(null);
    setToastMessage(`✓ Customer "${customerToDelete.name}" and all records removed from Khata.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmDeleteEntry = () => {
    if (!entryToDelete) return;
    deleteKhataEntry(entryToDelete.id);
    setEntryToDelete(null);
    setToastMessage('✓ Khata entry deleted & customer balance recalculated!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Customer total bills
  const customerTotalBill = customerTransactions.reduce((sum, t) => sum + (t.totalBill !== undefined ? t.totalBill : (t.type === 'baki' ? t.amount : 0)), 0);

  // If not authenticated as Admin, show private lock screen
  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Digital Khata Locked / খাতা লক</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Customer ledger and credit balances are private and confidential. Only the cafe owner / admin can unlock and view Khata Book.
          </p>
          <p className="text-[11px] text-cyan-400/90 font-medium mt-1">
            (শুধুমাত্র ক্যাফে অ্যাডমিন পিন দিয়ে খাতা দেখতে পারেন)
          </p>
        </div>

        {/* PIN Input & Keypad */}
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div className="flex justify-center">
            <input
              type="password"
              maxLength={6}
              autoFocus
              placeholder="Enter Admin PIN"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              className={`w-48 text-center text-xl tracking-widest font-mono font-bold bg-slate-950 border rounded-xl py-2.5 focus:outline-none transition-all ${
                pinError
                  ? 'border-rose-500 text-rose-400 shake animate-bounce'
                  : 'border-slate-700 text-cyan-300 focus:border-cyan-400'
              }`}
            />
          </div>

          {pinError && (
            <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Incorrect PIN! Default Admin PIN is {adminPin}</span>
            </p>
          )}

          {/* Quick Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map(btn => (
              <button
                key={btn}
                type="button"
                onClick={() => {
                  if (btn === 'C') setEnteredPin('');
                  else if (btn === '✓') handlePinSubmit();
                  else handleKeypadPress(btn);
                }}
                className="py-2 text-sm font-semibold rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-slate-200 transition-colors cursor-pointer active:scale-95"
              >
                {btn}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-400/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Digital Khata / খাতা আনলক করুন</span>
            </button>
          </div>
        </form>

        <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-3">
          Owner Default PIN: <span className="font-mono font-bold text-slate-400">{adminPin}</span> (Matched with UPI: 8609)
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-emerald-500/90 text-slate-950 px-4 py-2.5 rounded-xl font-medium text-xs shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Privacy Status & Lock Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-emerald-400">👑 Admin Confidential Mode Active</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 hidden sm:inline">Khata records & dues are visible only to you</span>
        </div>

        <button
          onClick={logoutAdmin}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 rounded-lg transition-colors cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock Khata / লক করুন</span>
        </button>
      </div>

      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4">
          <div className="flex items-center justify-between text-xs text-rose-300/80 mb-1">
            <span>Total Market Due / মোট বাকি</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-400">
              {settings.currencySymbol}{totalMarketDue.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across {totalDueCustomers} customers with pending balance
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Registered Khata Accounts</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {khataCustomers.length}
            </span>
            <span className="text-xs text-slate-500 font-mono">accounts</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Villagers, teachers, and shopkeeper digital ledgers
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>New Customer Khata</span>
            <UserPlus className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xs text-slate-300">
            Open new digital ledger for customer
          </div>
          <button
            onClick={() => openModal('newKhataCustomer')}
            className="mt-2.5 w-full py-1.5 px-3 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Open Khata / নতুন খাতা</span>
          </button>
        </div>

      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Customer Directory (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-3">
          
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Customer Khata List / খাতার খতিয়ান</span>
              </h3>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2 py-1 rounded transition-colors ${filterMode === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                >
                  All ({khataCustomers.length})
                </button>
                <button
                  onClick={() => setFilterMode('due_only')}
                  className={`px-2 py-1 rounded transition-colors ${filterMode === 'due_only' ? 'bg-rose-950 text-rose-300 font-semibold' : 'text-slate-400'}`}
                >
                  Due Only ({totalDueCustomers})
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer name, phone, or village..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Customer list items */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No customer khata found. Click "+ Open Khata" to add one.
              </div>
            ) : (
              filteredCustomers.map(customer => {
                const isSelected = activeCustomer?.id === customer.id;
                return (
                  <div
                    key={customer.id}
                    onClick={() => setSelectedKhataCustomerId(customer.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-500/80 bg-slate-900 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                          <span>{customer.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{customer.village}</span>
                          <span>·</span>
                          <span className="font-mono">{customer.phone}</span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div className={`font-mono text-base font-bold tabular-nums ${
                            customer.totalDue > 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {settings.currencySymbol}{customer.totalDue.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                            {customer.totalDue > 0 ? 'Due / বাকি' : 'Cleared ✓'}
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal('editKhataCustomer', customer.id);
                            }}
                            title="Edit customer details"
                            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomerToDelete({ id: customer.id, name: customer.name });
                            }}
                            title="Delete this customer khata"
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Active Customer Ledger Sheet (lg:col-span-7) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-5">
          
          {activeCustomer ? (
            <>
              {/* Customer Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-lg">{activeCustomer.name}</h3>
                    <button
                      onClick={() => openModal('editKhataCustomer', activeCustomer.id)}
                      title="Edit this customer"
                      className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button
                      onClick={() => setCustomerToDelete({ id: activeCustomer.id, name: activeCustomer.name })}
                      title="Delete this customer"
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{activeCustomer.village}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{activeCustomer.phone}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal('khataEntry', activeCustomer.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>+ New Entry (হিসাব এন্ট্রি)</span>
                  </button>

                  {activeCustomer.totalDue > 0 && (
                    <button
                      onClick={handleCopyWhatsApp}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-lg transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedMsg ? 'Copied!' : 'WhatsApp Reminder'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Total Dues Highlight Banner - 3 Columns: Total Bill, Lifetime Paid, Outstanding Due */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-500 block">Total Work Bill (মোট কাজের বিল)</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-slate-200 tabular-nums">
                    {settings.currencySymbol}{customerTotalBill.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-400 block">Total Payment Received (মোট জমা)</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">
                    {settings.currencySymbol}{activeCustomer.totalPaid.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-rose-400 block">Current Outstanding Due (বর্তমান বাকি)</span>
                  <span className={`font-mono text-xl sm:text-2xl font-bold tabular-nums ${
                    activeCustomer.totalDue > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {settings.currencySymbol}{activeCustomer.totalDue.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Quick Transaction Action Bar */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openModal('khataEntry', activeCustomer.id)}
                  className="py-2 px-3 text-xs font-semibold rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowDownLeft className="w-4 h-4 text-rose-400" />
                  <span>টাকা বাকি দিন (Give Credit)</span>
                </button>
                <button
                  onClick={() => openModal('khataEntry', activeCustomer.id)}
                  className="py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 text-emerald-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span>টাকা জমা নিন (Receive Payment)</span>
                </button>
              </div>

              {/* Individual Ledger Transactions Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-200 text-xs">
                    Transaction History & Timeline (লেনদেনের ইতিহাস ও বিল বিবরণ)
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {customerTransactions.length} entries · Edit or Delete anytime
                  </span>
                </div>

                {customerTransactions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                    No transactions recorded for this customer yet. Click "+ New Entry" above to add an entry.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                    {customerTransactions.map(t => {
                      const displayBill = t.totalBill !== undefined ? t.totalBill : (t.type === 'baki' ? t.amount : 0);
                      const displayPaid = t.paidAmount !== undefined ? t.paidAmount : (t.type === 'joma' ? t.amount : 0);
                      const displayDue = t.dueAmount !== undefined ? t.dueAmount : (t.type === 'baki' ? t.amount : 0);

                      return (
                        <div key={t.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-900/60 transition-colors group">
                          
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              t.type === 'baki' ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            }`}>
                              {t.type === 'baki' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>

                            <div>
                              <div className="font-semibold text-slate-200 text-sm">
                                {t.serviceName}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {new Date(t.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} · {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {t.notes && (
                                <div className="text-[11px] text-slate-400 italic mt-0.5">
                                  {t.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Financials & Actions Strip */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-11 sm:pl-0">
                            
                            {/* Detailed 3 Numbers: Bill, Paid, Due */}
                            <div className="flex items-center gap-3 text-right">
                              {displayBill > 0 && (
                                <div className="text-right">
                                  <div className="text-[10px] text-slate-500">মোট বিল</div>
                                  <div className="font-mono text-xs font-semibold text-slate-300">
                                    {settings.currencySymbol}{displayBill.toFixed(2)}
                                  </div>
                                </div>
                              )}

                              <div className="text-right">
                                <div className="text-[10px] text-emerald-500">জমা (Paid)</div>
                                <div className="font-mono text-xs font-bold text-emerald-400">
                                  {settings.currencySymbol}{displayPaid.toFixed(2)}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-[10px] text-rose-400">বাকি (Due)</div>
                                <div className="font-mono text-sm font-bold text-rose-400">
                                  {settings.currencySymbol}{displayDue.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons: Edit & Delete */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedKhataTransaction(t);
                                  openModal('editKhataEntry');
                                }}
                                title="Edit this entry / এডিট করুন"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setEntryToDelete(t)}
                                title="Delete this entry / হিসাব মুছুন"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 opacity-70 group-hover:opacity-100 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              Select or add a customer on the left to view their Khata sheet.
            </div>
          )}

        </div>

      </div>

      {/* Confirmation Modal for Customer Deletion */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-rose-900/60 bg-slate-900 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/80 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setCustomerToDelete(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 text-sm">
                Delete Customer Khata? / খাতা মুছে ফেলবেন?
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Are you sure you want to completely delete <strong className="text-white">{customerToDelete.name}</strong> from Digital Khata? All due records and transaction history will be permanently deleted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCustomerToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel / বাতিল
              </button>
              <button
                onClick={handleConfirmDeleteCustomer}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Khata</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Individual Entry Deletion */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-rose-900/60 bg-slate-900 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/80 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setEntryToDelete(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 text-sm">
                Delete Khata Entry? / হিসাব এন্ট্রি মুছবেন?
              </h4>
              <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Item:</span>
                  <span className="font-semibold text-slate-200">{entryToDelete.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className={entryToDelete.type === 'baki' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {entryToDelete.type === 'baki' ? 'বাকি (Due)' : 'জমা (Paid)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-mono font-bold text-white">
                    {settings.currencySymbol}{entryToDelete.amount.toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                This transaction will be removed and customer's outstanding balance will be automatically adjusted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEntryToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel / বাতিল
              </button>
              <button
                onClick={handleConfirmDeleteEntry}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
