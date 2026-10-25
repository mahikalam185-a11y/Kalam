import React, { useState, useEffect } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { ServiceCategory, ServiceOrderStatus } from '../../types';
import {
  X,
  Check,
  Camera,
  FileText,
  Upload,
  Trash2,
  AlertCircle,
  Coins
} from 'lucide-react';

export const EditOrderModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    selectedOrder,
    updateServiceOrder,
    deleteServiceOrder,
    settings
  } = useCyberCafe();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerVillage, setCustomerVillage] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('pan_card');
  const [serviceName, setServiceName] = useState('');
  const [cardType, setCardType] = useState('');
  const [totalFee, setTotalFee] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [status, setStatus] = useState<ServiceOrderStatus>('received');
  const [ackNumber, setAckNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Photo & Signature
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedOrder) {
      setCustomerName(selectedOrder.customerName);
      setCustomerPhone(selectedOrder.customerPhone);
      setCustomerVillage(selectedOrder.customerVillage || '');
      setServiceCategory(selectedOrder.serviceCategory);
      setServiceName(selectedOrder.serviceName);
      setCardType(selectedOrder.cardType || '');
      setTotalFee(selectedOrder.totalFee.toString());
      setAdvancePaid(selectedOrder.advancePaid.toString());
      setStatus(selectedOrder.status);
      setAckNumber(selectedOrder.ackNumber || '');
      setNotes(selectedOrder.notes || '');
      setPhotoUrl(selectedOrder.photoUrl || null);
      setSignatureUrl(selectedOrder.signatureUrl || null);
      setDocumentUrl(selectedOrder.documentUrl || null);
    }
  }, [selectedOrder]);

  if (activeModal !== 'editOrder' || !selectedOrder) return null;

  const parsedTotal = parseFloat(totalFee) || 0;
  const parsedAdvance = parseFloat(advancePaid) || 0;
  const calculatedDue = Math.max(0, parsedTotal - parsedAdvance);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setPhotoUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setSignatureUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setDocumentUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    updateServiceOrder(selectedOrder.id, {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerVillage: customerVillage.trim() || undefined,
      serviceCategory,
      serviceName: serviceName.trim(),
      cardType: cardType.trim() || undefined,
      totalFee: parsedTotal,
      advancePaid: parsedAdvance,
      status,
      ackNumber: ackNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      photoUrl: photoUrl || undefined,
      signatureUrl: signatureUrl || undefined,
      documentUrl: documentUrl || undefined
    });

    closeModal();
  };

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [selectedDiscountPct, setSelectedDiscountPct] = useState<number>(0);

  const handleApplyDiscount = (pct: number) => {
    setSelectedDiscountPct(pct);
    const originalRate = selectedOrder.totalFee;
    const discounted = Math.max(0, Math.round(originalRate * (1 - pct / 100)));
    setTotalFee(discounted.toString());
  };

  const handleConfirmDelete = () => {
    deleteServiceOrder(selectedOrder.id);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              Edit Seva Order / কাজ সংশোধন করুন ({selectedOrder.tokenNumber})
            </h3>
            <p className="text-xs text-slate-400">
              Update customer details, fee, payment received, and photo/sign
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Customer Details */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
            <h4 className="font-semibold text-slate-200">Customer Details / গ্রাহকের নাম ও ঠিকানা</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Village / Para</label>
                <input
                  type="text"
                  value={customerVillage}
                  onChange={(e) => setCustomerVillage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Category</label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2"
              >
                <option value="driving_licence">Driving Licence (DL)</option>
                <option value="pan_card">PAN Card</option>
                <option value="pvc_card">PVC Card</option>
                <option value="aadhaar">Aadhaar</option>
                <option value="voter">Voter ID</option>
                <option value="form_fillup">Job Forms</option>
                <option value="other">Other Seva</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Service Title *</label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Card / Specific Type</label>
              <input
                type="text"
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Fee & Payment Section (কত টাকা দেওয়া আছে / পেমেন্ট করেছে) */}
          <div className="p-3.5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>Payment Details / মোট ফি ও কত টাকা দেওয়া আছে</span>
              </h4>

              {/* Discount selector chips: 0%, 5%, 10%, 15%, 20% */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 mr-1">Discount:</span>
                {[0, 5, 10, 15, 20].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleApplyDiscount(pct)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                      selectedDiscountPct === pct
                        ? 'bg-cyan-400 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Total Fee / মোট ফি ({settings.currencySymbol}) *</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={totalFee}
                  onChange={(e) => setTotalFee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-base font-bold rounded-lg px-3 py-2 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Payment Received / কত টাকা দিয়েছে ({settings.currencySymbol}) *</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-base font-bold rounded-lg px-3 py-2 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Remaining Due / কত বাকি ({settings.currencySymbol})</label>
                <div className={`w-full py-2 px-3 rounded-lg border font-mono text-base font-bold flex items-center justify-between ${
                  calculatedDue > 0
                    ? 'bg-rose-950/40 border-rose-800 text-rose-400'
                    : 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                }`}>
                  <span>{settings.currencySymbol}{calculatedDue.toFixed(2)}</span>
                  <span className="text-[10px] font-sans font-normal">
                    {calculatedDue > 0 ? 'Due (বাকি)' : 'Full Paid ✓'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Status & Ack # */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceOrderStatus)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2"
              >
                <option value="received">1. Received / জমা নেওয়া</option>
                <option value="processing">2. Processing / তথ্য ভেরিফিকেশন</option>
                <option value="submitted">3. Submitted to Portal / পোর্টালে সাবমিট</option>
                <option value="printed_ready">4. Printed Ready / পিভিসি প্রিন্ট রেডি</option>
                <option value="delivered">5. Delivered / হ্যান্ডওভার কমপ্লিট</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Portal Ack / Ref Number</label>
              <input
                type="text"
                placeholder="e.g. NSDL Ack / NVSP Ref No"
                value={ackNumber}
                onChange={(e) => setAckNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 font-mono"
              />
            </div>
          </div>

          {/* Photos Upload & Manage */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
            <h4 className="font-semibold text-slate-200">Customer Photo & Signature Upload</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Photo */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-slate-400 mb-1.5">Passport Photo</span>
                {photoUrl ? (
                  <div className="space-y-1.5 flex flex-col items-center">
                    <img src={photoUrl} alt="Photo" className="w-16 h-20 object-cover rounded border border-cyan-500" />
                    <button type="button" onClick={() => setPhotoUrl(null)} className="text-[10px] text-rose-400 hover:underline">
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center py-2 w-full border border-dashed border-slate-700 hover:border-cyan-500 rounded">
                    <Camera className="w-5 h-5 text-slate-500 mb-1" />
                    <span className="text-[10px] text-cyan-400">Change / Upload</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Signature */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-slate-400 mb-1.5">Signature</span>
                {signatureUrl ? (
                  <div className="space-y-1.5 flex flex-col items-center">
                    <img src={signatureUrl} alt="Sign" className="w-24 h-12 object-contain bg-white rounded p-0.5 border border-cyan-500" />
                    <button type="button" onClick={() => setSignatureUrl(null)} className="text-[10px] text-rose-400 hover:underline">
                      Remove Signature
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center py-2 w-full border border-dashed border-slate-700 hover:border-cyan-500 rounded">
                    <FileText className="w-5 h-5 text-slate-500 mb-1" />
                    <span className="text-[10px] text-cyan-400">Change / Upload</span>
                    <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Document */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-slate-400 mb-1.5">ID Document</span>
                {documentUrl ? (
                  <div className="space-y-1.5 flex flex-col items-center">
                    <FileText className="w-8 h-8 text-emerald-400" />
                    <span className="text-[10px] text-slate-300">Attached ✓</span>
                    <button type="button" onClick={() => setDocumentUrl(null)} className="text-[10px] text-rose-400 hover:underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center py-2 w-full border border-dashed border-slate-700 hover:border-cyan-500 rounded">
                    <Upload className="w-5 h-5 text-slate-500 mb-1" />
                    <span className="text-[10px] text-cyan-400">Attach Document</span>
                    <input type="file" accept="image/*,.pdf" onChange={handleDocumentUpload} className="hidden" />
                  </label>
                )}
              </div>

            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-400 mb-1">Remarks / Memo</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {isConfirmingDelete ? (
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-rose-950/60 border border-rose-800/80">
                <span className="text-[11px] text-rose-300 font-semibold">Confirm delete?</span>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-2 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Order / ডিলিট করুন</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save Changes / সেভ করুন</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
