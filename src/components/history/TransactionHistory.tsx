import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { PaymentMethod, TransactionReceipt } from '../../types';
import {
  CreditCard,
  Search,
  Receipt,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  Download
} from 'lucide-react';

export const TransactionHistory: React.FC = () => {
  const {
    transactions,
    setActiveReceipt,
    openModal,
    settings
  } = useCyberCafe();

  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentMethod>('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(tx => {
    if (paymentFilter !== 'all' && tx.paymentMethod !== paymentFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const recMatch = tx.receiptNumber.toLowerCase().includes(q);
      const custMatch = tx.customerName.toLowerCase().includes(q);
      const stMatch = tx.stationName ? tx.stationName.toLowerCase().includes(q) : false;
      return recMatch || custMatch || stMatch;
    }
    return true;
  });

  const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalCount = transactions.length;
  const avgOrderValue = totalCount > 0 ? totalRevenue / totalCount : 0;

  const handleViewReceipt = (receipt: TransactionReceipt) => {
    setActiveReceipt(receipt);
    openModal('receipt');
  };

  const handleExportCsv = () => {
    const headers = ['Receipt', 'Date', 'Customer', 'Station', 'DurationMin', 'TimeCharge', 'OrdersCharge', 'Discount', 'Tax', 'Total', 'PaymentMethod'];
    const rows = filtered.map(t => [
      t.receiptNumber,
      new Date(t.timestamp).toISOString(),
      `"${t.customerName}"`,
      `"${t.stationName || 'Walk-in Desk'}"`,
      t.durationMinutes,
      t.timeCharge.toFixed(2),
      t.ordersCharge.toFixed(2),
      t.discountAmount.toFixed(2),
      t.taxAmount.toFixed(2),
      t.totalAmount.toFixed(2),
      t.paymentMethod
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NetPulse_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Ledger Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {settings.currencySymbol}{totalRevenue.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across {totalCount} settled billing invoices
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Average Ticket Size</span>
            <Receipt className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {settings.currencySymbol}{avgOrderValue.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Blended station time + food + print services
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Ledger Data Export</span>
            <Download className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xs text-slate-300">
            Download standard bookkeeping CSV file
          </div>
          <button
            onClick={handleExportCsv}
            className="mt-2.5 w-full py-1.5 px-3 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV Audit Ledger</span>
          </button>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        
        {/* Payment method segmented tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Invoices' },
            { id: 'cash', label: 'Cash' },
            { id: 'card', label: 'Credit Card' },
            { id: 'wallet_balance', label: 'Member Balance' },
            { id: 'qr_pay', label: 'QR Pay' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setPaymentFilter(opt.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                paymentFilter === opt.id
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search receipt #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:border-cyan-500"
          />
        </div>

      </div>

      {/* Ledger Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-medium text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Origin / Terminal</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-right">Time Charge</th>
                <th className="py-3 px-4 text-right">Orders Tab</th>
                <th className="py-3 px-4 text-right">Total Settled</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-right">Receipt Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  {/* Receipt # */}
                  <td className="py-3 px-4">
                    <span className="font-mono text-cyan-400 font-semibold">
                      {tx.receiptNumber}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px] tabular-nums">
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    <div className="text-[10px] text-slate-500">
                      {new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </td>

                  {/* Origin */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-200">
                      {tx.stationName || 'Counter POS / Desk'}
                    </div>
                    {tx.durationMinutes > 0 && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        {tx.durationMinutes} mins session
                      </div>
                    )}
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-medium">{tx.customerName}</div>
                    {tx.isMember && (
                      <div className="text-[10px] text-cyan-400 font-mono">Member Account</div>
                    )}
                  </td>

                  {/* Time Charge */}
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                    {tx.timeCharge > 0 ? `${settings.currencySymbol}${tx.timeCharge.toFixed(2)}` : '—'}
                  </td>

                  {/* Orders Tab */}
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                    {tx.ordersCharge > 0 ? (
                      <div>
                        <span>{settings.currencySymbol}{tx.ordersCharge.toFixed(2)}</span>
                        <div className="text-[10px] text-slate-500">{tx.orders.length} items</div>
                      </div>
                    ) : '—'}
                  </td>

                  {/* Total Settled */}
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    <span className="font-bold text-sm text-emerald-400">
                      {settings.currencySymbol}{tx.totalAmount.toFixed(2)}
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="py-3 px-4 text-center">
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {tx.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleViewReceipt(tx)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors inline-flex items-center gap-1 border border-slate-700/60"
                    >
                      <Printer className="w-3 h-3 text-cyan-400" />
                      <span>View</span>
                    </button>
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
