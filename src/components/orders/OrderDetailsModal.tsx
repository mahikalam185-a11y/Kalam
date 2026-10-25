import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { ServiceOrderStatus, PaymentMethod } from '../../types';
import {
  X,
  Camera,
  FileText,
  Download,
  CheckCircle2,
  Share2,
  Clock,
  Phone,
  User,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  Trash2
} from 'lucide-react';

export const OrderDetailsModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    selectedOrder,
    updateServiceOrderStatus,
    updateServiceOrderPayment,
    deleteServiceOrder,
    openModal,
    settings
  } = useCyberCafe();

  const [newStatus, setNewStatus] = useState<ServiceOrderStatus>(selectedOrder?.status || 'received');
  const [ackInput, setAckInput] = useState<string>(selectedOrder?.ackNumber || '');
  const [settleAmount, setSettleAmount] = useState<string>(selectedOrder?.dueAmount.toString() || '0');
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>('cash');
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (activeModal !== 'orderDetails' || !selectedOrder) return null;

  const order = selectedOrder;

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateServiceOrderStatus(order.id, newStatus, ackInput.trim() || undefined);
    closeModal();
  };

  const handleSettleDue = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(settleAmount) || 0;
    if (amount <= 0) return;
    updateServiceOrderPayment(order.id, amount, settleMethod);
    closeModal();
    openModal('receipt');
  };

  const handleConfirmDelete = () => {
    deleteServiceOrder(order.id);
    setShowDeleteConfirm(false);
    closeModal();
  };

  // WhatsApp message generator
  const getWhatsAppMessage = () => {
    return `Namaskar ${order.customerName},\nYour order for ${order.serviceName} at ${settings.cafeName} is currently: ${order.status.toUpperCase()}.\nToken No: ${order.tokenNumber}${order.ackNumber ? `\nAck/Ref No: ${order.ackNumber}` : ''}${order.dueAmount > 0 ? `\nPending Balance to clear: ₹${order.dueAmount}` : '\nPayment: Cleared'}\nPlease visit our cafe with your original documents.\nThank you!`;
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(getWhatsAppMessage());
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-400 font-bold text-sm">
                {order.tokenNumber}
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded capitalize ${
                order.status === 'delivered' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                order.status === 'printed_ready' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                order.status === 'submitted' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <h3 className="font-semibold text-slate-100 text-sm mt-0.5">
              {order.serviceName}
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Customer & Village strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-slate-500 block">Customer Name</span>
              <span className="text-slate-200 font-bold text-sm">{order.customerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Contact Phone</span>
              <span className="text-slate-200 font-mono font-medium">{order.customerPhone}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Village / Address</span>
              <span className="text-slate-200">{order.customerVillage || 'Local Area'}</span>
            </div>
          </div>

          {/* Photo & Signature Viewer if uploaded */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <h4 className="font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Uploaded Client Photo & Documents</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Click download to use in NSDL / UTI portal
              </span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Photo Box */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-slate-400 mb-1.5">Passport Photo</span>
                {order.photoUrl ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <img
                      src={order.photoUrl}
                      alt="Customer"
                      className="w-24 h-28 object-cover rounded border border-cyan-500 shadow-md"
                    />
                    <a
                      href={order.photoUrl}
                      download={`Photo_${order.customerName.replace(/\s+/g, '_')}.jpg`}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  </div>
                ) : (
                  <div className="py-6 text-slate-500 italic">No photo attached</div>
                )}
              </div>

              {/* Signature Box */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-slate-400 mb-1.5">Signature / Thumb</span>
                {order.signatureUrl ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <img
                      src={order.signatureUrl}
                      alt="Signature"
                      className="w-32 h-16 object-contain rounded bg-white p-1 border border-cyan-500"
                    />
                    <a
                      href={order.signatureUrl}
                      download={`Sign_${order.customerName.replace(/\s+/g, '_')}.jpg`}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  </div>
                ) : (
                  <div className="py-6 text-slate-500 italic">No signature attached</div>
                )}
              </div>

              {/* ID Proof Box */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-slate-400 mb-1.5">Aadhaar / ID Proof</span>
                {order.documentUrl ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <FileText className="w-10 h-10 text-emerald-400 my-2" />
                    <span className="text-[10px] text-slate-300 truncate max-w-[140px] font-medium">
                      {order.documentFileName || 'Document Copy'}
                    </span>
                    <a
                      href={order.documentUrl}
                      download={order.documentFileName || `ID_${order.customerName.replace(/\s+/g, '_')}`}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  </div>
                ) : (
                  <div className="py-6 text-slate-500 italic">No document attached</div>
                )}
              </div>

              {/* Payment Proof / Cropped Slip Box */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-slate-400 mb-1.5">Payment Slip / UTR</span>
                {order.paymentProofUrl ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <img
                      src={order.paymentProofUrl}
                      alt="Payment Receipt"
                      className="w-20 h-24 object-cover rounded border border-emerald-500 shadow-xs"
                    />
                    {order.paymentUtr && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold truncate max-w-[140px]">
                        UTR: {order.paymentUtr}
                      </span>
                    )}
                    <a
                      href={order.paymentProofUrl}
                      download={`Payment_${order.tokenNumber}.jpg`}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  </div>
                ) : (
                  <div className="py-6 text-slate-500 italic">
                    {order.paymentUtr ? (
                      <span className="font-mono text-xs text-cyan-400">UTR: {order.paymentUtr}</span>
                    ) : (
                      'No slip attached'
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Payment & Dues Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
            <h4 className="font-semibold text-slate-200">Billing & Payment Status</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Total Fee</span>
                <span className="font-mono text-base font-bold text-slate-100">
                  {settings.currencySymbol}{order.totalFee.toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Advance Paid</span>
                <span className="font-mono text-base font-bold text-emerald-400">
                  {settings.currencySymbol}{order.advancePaid.toFixed(2)}
                </span>
              </div>
              <div className={`p-2.5 rounded-lg border ${
                order.dueAmount > 0 ? 'bg-rose-950/30 border-rose-800 text-rose-400' : 'bg-slate-900 border-slate-800 text-emerald-400'
              }`}>
                <span className="block text-[11px] opacity-80">Remaining Due / বাকি</span>
                <span className="font-mono text-base font-bold">
                  {settings.currencySymbol}{order.dueAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Settle Due form if due > 0 */}
            {order.dueAmount > 0 && (
              <form onSubmit={handleSettleDue} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 mt-2">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>Receive Customer Due Payment</span>
                  <span className="text-[11px] text-slate-500 font-mono">Clears Khata ledger</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs">
                      {settings.currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={settleAmount}
                      onChange={(e) => setSettleAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 pl-6 py-1.5 font-mono text-xs"
                    />
                  </div>
                  <select
                    value={settleMethod}
                    onChange={(e) => setSettleMethod(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="cash">Cash</option>
                    <option value="qr_pay">UPI / QR</option>
                    <option value="card">Card</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded whitespace-nowrap"
                  >
                    Receive & Settle
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Status Update Form */}
          <form onSubmit={handleStatusUpdate} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <h4 className="font-semibold text-slate-200">Update Order Progress</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Status Workflow Stage</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ServiceOrderStatus)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                >
                  <option value="received">1. Received / ডকুমেন্টস জমা নেওয়া</option>
                  <option value="processing">2. Processing / তথ্য ভেরিফিকেশন</option>
                  <option value="submitted">3. Submitted to Portal / পোর্টালে সাবমিট</option>
                  <option value="printed_ready">4. Printed Ready / পিভিসি প্রিন্ট কমপ্লিট</option>
                  <option value="delivered">5. Delivered / গ্রাহককে হ্যান্ডওভার</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Portal Ack / Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. NSDL Ack No / EPIC No"
                  value={ackInput}
                  onChange={(e) => setAckInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
              >
                Save Progress
              </button>
            </div>
          </form>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className="px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedMsg ? 'Copied to Clipboard!' : 'Copy WhatsApp Reminder'}</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
              title="Delete order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={closeModal}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Delete Confirmation In-App Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-xl border border-rose-900 bg-slate-900 p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Delete Order? / অর্ডার মুছবেন?</h4>
                  <p className="text-xs text-slate-400">Order Token: {order.tokenNumber}</p>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                Are you sure you want to delete this order for <strong className="text-white">{order.customerName}</strong>? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md"
                >
                  Yes, Delete Order
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
