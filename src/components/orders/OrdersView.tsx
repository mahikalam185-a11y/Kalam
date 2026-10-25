import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { ServiceCategory, ServiceOrderStatus } from '../../types';
import {
  FileText,
  CreditCard,
  Camera,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Coins,
  ArrowRight,
  AlertTriangle,
  X
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const {
    serviceOrders,
    openModal,
    setSelectedOrder,
    deleteServiceOrder,
    settings
  } = useCyberCafe();

  const [categoryFilter, setCategoryFilter] = useState<'all' | ServiceCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ServiceOrderStatus | 'active'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'due' | 'paid' | 'partial'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'online' | 'counter'>('all');
  const [search, setSearch] = useState('');

  const filteredOrders = serviceOrders.filter(order => {
    if (categoryFilter !== 'all' && order.serviceCategory !== categoryFilter) return false;
    if (paymentFilter !== 'all' && order.paymentStatus !== paymentFilter) return false;
    if (sourceFilter === 'online' && !order.isOnlineOrder) return false;
    if (sourceFilter === 'counter' && order.isOnlineOrder) return false;
    if (statusFilter === 'active') {
      if (order.status === 'delivered' || order.status === 'cancelled') return false;
    } else if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const tokenMatch = order.tokenNumber.toLowerCase().includes(q);
      const nameMatch = order.customerName.toLowerCase().includes(q);
      const phoneMatch = order.customerPhone.toLowerCase().includes(q);
      const serviceMatch = order.serviceName.toLowerCase().includes(q);
      const ackMatch = order.ackNumber?.toLowerCase().includes(q) || false;
      return tokenMatch || nameMatch || phoneMatch || serviceMatch || ackMatch;
    }
    return true;
  });

  const onlineOrdersCount = serviceOrders.filter(o => o.isOnlineOrder && o.status !== 'delivered').length;

  const activeOrdersCount = serviceOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const pvcQueueCount = serviceOrders.filter(o => o.serviceCategory === 'pvc_card' && o.status !== 'delivered').length;
  const totalOutstandingDue = serviceOrders.reduce((sum, o) => sum + o.dueAmount, 0);
  const totalCollectedAdvance = serviceOrders.reduce((sum, o) => sum + o.advancePaid, 0);

  const getStatusBadge = (status: ServiceOrderStatus) => {
    switch (status) {
      case 'received':
        return <span className="font-mono text-[11px] text-amber-400">Received (জমা)</span>;
      case 'processing':
        return <span className="font-mono text-[11px] text-blue-400">Processing</span>;
      case 'submitted':
        return <span className="font-mono text-[11px] text-purple-400">Submitted (পোর্টালে)</span>;
      case 'printed_ready':
        return <span className="font-mono text-[11px] text-cyan-300 font-semibold">PVC Ready (প্রিন্ট রেডি)</span>;
      case 'delivered':
        return <span className="font-mono text-[11px] text-emerald-400">Delivered (ডেলিভার্ড)</span>;
      default:
        return <span className="font-mono text-[11px] text-slate-500">Cancelled</span>;
    }
  };

  const getPaymentBadge = (status: 'paid' | 'partial' | 'due') => {
    switch (status) {
      case 'paid':
        return <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">Paid (পরিশোধ)</span>;
      case 'partial':
        return <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">Partial (কিছু জমা)</span>;
      case 'due':
        return <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">Due (বাকি)</span>;
    }
  };

  const [orderToDelete, setOrderToDelete] = useState<typeof serviceOrders[0] | null>(null);

  const handleOpenDetails = (order: typeof serviceOrders[0]) => {
    setSelectedOrder(order);
    openModal('orderDetails');
  };

  const handleOpenEdit = (order: typeof serviceOrders[0]) => {
    setSelectedOrder(order);
    openModal('editOrder');
  };

  const handleConfirmDelete = () => {
    if (orderToDelete) {
      deleteServiceOrder(orderToDelete.id);
      setOrderToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Pending Seva Orders (চলতি কাজ)</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {activeOrdersCount}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {serviceOrders.length} total</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Aadhaar, Voter, PAN & Forms in pipeline
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>PVC Smart Card Queue</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-300">
              {pvcQueueCount}
            </span>
            <span className="text-xs text-slate-500">cards waiting</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Thermal plastic card print line
          </div>
        </div>

        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4">
          <div className="flex items-center justify-between text-xs text-rose-300/80 mb-1">
            <span>Customer Pending Dues (মোট বাকি)</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-400">
              {settings.currencySymbol}{totalOutstandingDue.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">due</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-mono">
            Paid to date: {settings.currencySymbol}{totalCollectedAdvance.toFixed(2)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>New Seva Work Order</span>
            <Plus className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xs text-slate-300">
            Add PAN, Voter, Aadhaar or PVC card request
          </div>
          <button
            onClick={() => openModal('newOrder')}
            className="mt-2.5 w-full py-2 px-3 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ New Kaj / নতুন কাজ</span>
          </button>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
        
        {/* Category Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Kaj (সব)' },
            { id: 'driving_licence', label: 'Driving Licence (DL)' },
            { id: 'pan_card', label: 'PAN Card' },
            { id: 'pvc_card', label: 'PVC Cards' },
            { id: 'aadhaar', label: 'Aadhaar' },
            { id: 'voter', label: 'Voter ID' },
            { id: 'form_fillup', label: 'Job Forms' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Payment and Search */}
        <div className="flex items-center gap-2">
          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Payment Status</option>
            <option value="due">Due Only (বাকি আছে)</option>
            <option value="partial">Partial (আংশিক জমা)</option>
            <option value="paid">Full Paid (পরিশোধ)</option>
          </select>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Stages</option>
            <option value="active">Active (Pending Only)</option>
            <option value="received">Received</option>
            <option value="processing">Processing</option>
            <option value="submitted">Submitted to Portal</option>
            <option value="printed_ready">PVC Printed / Ready</option>
            <option value="delivered">Delivered</option>
          </select>

          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search token, name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:border-cyan-500"
            />
          </div>
        </div>

      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-center">
          <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-slate-300 font-medium text-sm">No Seva Orders Found</h4>
          <p className="text-slate-500 text-xs mt-1">
            Add a new citizen work order for PAN, Voter, Aadhaar or PVC card.
          </p>
          <button
            onClick={() => openModal('newOrder')}
            className="mt-3 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create First Seva Order</span>
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-medium text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Token & Date</th>
                  <th className="py-3 px-4">Customer & Village</th>
                  <th className="py-3 px-4">Service & Type</th>
                  <th className="py-3 px-4 text-center">Photo</th>
                  <th className="py-3 px-4 text-right">মোট ফি (Total)</th>
                  <th className="py-3 px-4 text-right">কত দিয়েছে (Paid)</th>
                  <th className="py-3 px-4 text-right">বাকি (Due)</th>
                  <th className="py-3 px-4 text-center">পেমেন্ট</th>
                  <th className="py-3 px-4 text-center">কাজের স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">Actions (Edit / Delete)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Token */}
                    <td className="py-3 px-4 font-mono">
                      <div className="text-cyan-400 font-semibold">{order.tokenNumber}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{order.customerPhone}</div>
                      {order.customerVillage && (
                        <div className="text-[10px] text-slate-500">{order.customerVillage}</div>
                      )}
                    </td>

                    {/* Service & Type */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{order.serviceName}</div>
                      {order.cardType && (
                        <div className="text-[11px] text-cyan-400 font-mono">{order.cardType}</div>
                      )}
                      {order.ackNumber && (
                        <div className="text-[10px] text-slate-500 font-mono">Ack: {order.ackNumber}</div>
                      )}
                    </td>

                    {/* Photo / Docs Status */}
                    <td className="py-3 px-4 text-center">
                      {order.photoUrl ? (
                        <img
                          src={order.photoUrl}
                          alt="Photo"
                          className="w-8 h-9 object-cover rounded border border-cyan-500/50 mx-auto"
                        />
                      ) : (
                        <div className="w-8 h-9 rounded bg-slate-800 flex items-center justify-center text-slate-600 mx-auto">
                          <Camera className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </td>

                    {/* Total Fee */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200 font-semibold">
                      {settings.currencySymbol}{order.totalFee.toFixed(2)}
                    </td>

                    {/* Advance / Paid */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                      {settings.currencySymbol}{order.advancePaid.toFixed(2)}
                    </td>

                    {/* Due */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <span className={`font-bold ${order.dueAmount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                        {order.dueAmount > 0 ? `${settings.currencySymbol}${order.dueAmount.toFixed(2)}` : 'Nil'}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-4 text-center">
                      {getPaymentBadge(order.paymentStatus)}
                    </td>

                    {/* Progress Status */}
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>

                    {/* Actions: Manage, Edit, Delete */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenDetails(order)}
                          title="View order & photos"
                          className="px-2 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors inline-flex items-center gap-1 border border-slate-700/60"
                        >
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(order)}
                          title="Edit order, update fee & payment"
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                        </button>

                        <button
                          onClick={() => setOrderToDelete(order)}
                          title="Delete order / কাজ মুছুন"
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Order Deletion */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-rose-900/60 bg-slate-900 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/80 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setOrderToDelete(null)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 text-sm">
                Delete Service Order? / কাজ মুছে ফেলবেন?
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Are you sure you want to delete order <strong className="text-white font-mono">{orderToDelete.tokenNumber}</strong> for <strong className="text-white">{orderToDelete.customerName}</strong> ({orderToDelete.serviceName})?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel / বাতিল
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete / মুছুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
