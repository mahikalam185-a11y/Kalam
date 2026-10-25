import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { ServiceCategory } from '../../types';
import { ImageCropperModal, CropPreset } from '../common/ImageCropperModal';
import {
  X,
  Plus,
  Upload,
  Camera,
  FileText,
  CreditCard,
  User,
  Phone,
  MapPin,
  Check,
  AlertCircle,
  Sparkles,
  Crop as CropIcon,
  QrCode,
  Copy
} from 'lucide-react';

export const NewOrderModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    addServiceOrder,
    rateChart,
    settings
  } = useCyberCafe();

  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('pan_card');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('rc-7'); // default new PAN 49A
  const [customServiceName, setCustomServiceName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerVillage, setCustomerVillage] = useState('');
  const [cardType, setCardType] = useState('PAN Card Physical (Form 49A)');
  const [totalFee, setTotalFee] = useState<string>('220');
  const [advancePaid, setAdvancePaid] = useState<string>('150');
  const [notes, setNotes] = useState('');
  const [ackNumber, setAckNumber] = useState('');

  // Photo & Signature Upload State
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [signatureName, setSignatureName] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string>('');
  const [baseFee, setBaseFee] = useState<number>(70);
  const [appliedDiscountPct, setAppliedDiscountPct] = useState<number>(0);

  // UPI Payment Proof & Cropper State
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [paymentUtr, setPaymentUtr] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'due'>('upi');
  const [cropperModal, setCropperModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    target: 'photo' | 'signature' | 'document' | 'payment';
    preset: CropPreset;
    title: string;
  } | null>(null);

  if (activeModal !== 'newOrder') return null;

  // Filter rate chart options by category
  const categoryServices = rateChart.filter(r => {
    if (serviceCategory === 'driving_licence') return r.category === 'driving_licence';
    if (serviceCategory === 'pan_card') return r.category === 'pan_services';
    if (serviceCategory === 'pvc_card') return r.category === 'pvc_cards';
    if (serviceCategory === 'voter') return r.category === 'voter_services';
    if (serviceCategory === 'aadhaar') return r.category === 'aadhaar_services';
    if (serviceCategory === 'form_fillup') return r.category === 'online_forms';
    return true;
  });

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const item = rateChart.find(r => r.id === serviceId);
    if (item) {
      setBaseFee(item.customerRate);
      setTotalFee(item.customerRate.toString());
      setAppliedDiscountPct(0);
      setCardType(item.serviceName);
      if (item.customerRate <= 100) {
        setAdvancePaid(item.customerRate.toString());
      } else {
        setAdvancePaid((Math.round(item.customerRate * 0.6 / 10) * 10).toString());
      }
    }
  };

  const handleCategoryChange = (cat: ServiceCategory) => {
    setServiceCategory(cat);
    const matching = rateChart.filter(r => {
      if (cat === 'driving_licence') return r.category === 'driving_licence';
      if (cat === 'pan_card') return r.category === 'pan_services';
      if (cat === 'pvc_card') return r.category === 'pvc_cards';
      if (cat === 'voter') return r.category === 'voter_services';
      if (cat === 'aadhaar') return r.category === 'aadhaar_services';
      if (cat === 'form_fillup') return r.category === 'online_forms';
      return true;
    });
    if (matching.length > 0) {
      handleServiceSelect(matching[0].id);
    }
  };

  const handleApplyDiscount = (pct: number) => {
    setAppliedDiscountPct(pct);
    const calculated = Math.max(0, Math.round(baseFee * (1 - pct / 100)));
    setTotalFee(calculated.toString());
  };

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Signature upload handler
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSignatureName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Document upload handler
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setDocumentUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Payment Proof upload handler
  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        // Automatically open cropper for payment receipt!
        setCropperModal({
          isOpen: true,
          imageUrl: rawUrl,
          target: 'payment',
          preset: 'payment',
          title: 'Crop Payment Receipt / UTR Slip (পেমেন্ট স্লিপ ক্রপ করুন)'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBase64: string) => {
    if (!cropperModal) return;
    if (cropperModal.target === 'photo') {
      setPhotoUrl(croppedBase64);
      setPhotoName('Cropped_Passport_Photo.jpg');
    } else if (cropperModal.target === 'signature') {
      setSignatureUrl(croppedBase64);
      setSignatureName('Cropped_Signature.jpg');
    } else if (cropperModal.target === 'document') {
      setDocumentUrl(croppedBase64);
      setDocumentName('Cropped_Document.jpg');
    } else if (cropperModal.target === 'payment') {
      setPaymentProofUrl(croppedBase64);
    }
    setCropperModal(null);
  };

  const parsedTotal = parseFloat(totalFee) || 0;
  const parsedAdvance = parseFloat(advancePaid) || 0;
  const dueAmount = Math.max(0, parsedTotal - parsedAdvance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    const matchedService = rateChart.find(r => r.id === selectedServiceId);
    const serviceName = customServiceName.trim() || matchedService?.serviceName || 'Citizen Seva Service';

    addServiceOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerVillage: customerVillage.trim() || 'Local Area',
      serviceCategory,
      serviceName,
      cardType: cardType.trim(),
      status: 'received',
      ackNumber: ackNumber.trim() || undefined,
      totalFee: parsedTotal,
      advancePaid: parsedAdvance,
      dueAmount,
      paymentStatus: dueAmount === 0 ? 'paid' : (parsedAdvance > 0 ? 'partial' : 'due'),
      photoUrl: photoUrl || undefined,
      signatureUrl: signatureUrl || undefined,
      documentUrl: documentUrl || undefined,
      documentFileName: documentName || undefined,
      paymentProofUrl: paymentProofUrl || undefined,
      paymentUtr: paymentUtr.trim() || undefined,
      paymentMode,
      notes: notes.trim() || undefined
    });

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                Add New Seva Order / নতুন কাজের অর্ডার
              </h3>
              <p className="text-xs text-slate-400">
                Aadhaar, Voter, PAN Card with Photo Upload & Digital Khata Sync
              </p>
            </div>
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
          
          {/* Service Category Tabs */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Select Seva Category / কাজের বিভাগ
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
              {[
                { id: 'driving_licence', label: 'Driving Licence' },
                { id: 'pan_card', label: 'PAN Card' },
                { id: 'pvc_card', label: 'PVC Card' },
                { id: 'aadhaar', label: 'Aadhaar' },
                { id: 'voter', label: 'Voter ID' },
                { id: 'form_fillup', label: 'Job Forms' },
                { id: 'other', label: 'Other Seva' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id as ServiceCategory)}
                  className={`py-1.5 px-2 text-center rounded-md font-medium transition-colors ${
                    serviceCategory === cat.id
                      ? 'bg-cyan-500 text-slate-950 shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Specific Service from Rate Chart */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Select Service from Rate Chart
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500"
              >
                {categoryServices.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.serviceName} — ₹{item.customerRate}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Card Type / Service Specification
              </label>
              <input
                type="text"
                placeholder="e.g. New Form 49A, Aadhaar PVC Smart Card"
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Customer Information / গ্রাহকের বিবরণ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anup Mondal"
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
                  placeholder="+91 98321 00000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Village / Para / Ward</label>
                <input
                  type="text"
                  placeholder="e.g. Gobindapur Ward 4"
                  value={customerVillage}
                  onChange={(e) => setCustomerVillage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* PHOTO & SIGNATURE UPLOAD SECTION (Mandatory Requirement: "pan er photo upload hobe") */}
          <div className="p-3.5 rounded-xl border border-cyan-900/40 bg-cyan-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Photo & Signature Upload (প্যান ও ডকুমেন্টের ছবি আপলোড)</span>
              </h4>
              <span className="text-[11px] text-cyan-400 font-mono">
                NSDL/UTI Specs: 213×213 (300 DPI)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Photo Upload */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-semibold text-slate-300 mb-2">Customer Photo</span>
                {photoUrl ? (
                  <div className="space-y-1.5 flex flex-col items-center">
                    <img
                      src={photoUrl}
                      alt="Customer"
                      className="w-20 h-24 object-cover rounded border border-cyan-500/60 shadow-xs"
                    />
                    <span className="text-[10px] text-slate-400 truncate max-w-[140px]">{photoName}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCropperModal({
                          isOpen: true,
                          imageUrl: photoUrl,
                          target: 'photo',
                          preset: 'passport',
                          title: 'Crop Passport Photo (পাসপোর্ট সাইজ ক্রপ)'
                        })}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <CropIcon className="w-3 h-3" />
                        <span>Crop (পাসপোর্ট)</span>
                      </button>
                      <span className="text-slate-600">·</span>
                      <button
                        type="button"
                        onClick={() => { setPhotoUrl(null); setPhotoName(''); }}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center py-3 w-full border border-dashed border-slate-700 hover:border-cyan-500 rounded-lg transition-colors">
                    <Camera className="w-6 h-6 text-slate-500 mb-1" />
                    <span className="text-[11px] text-cyan-400 font-medium">Upload Photo</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">JPG / PNG / Crop</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Signature Upload */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-semibold text-slate-300 mb-2">Customer Signature</span>
                {signatureUrl ? (
                  <div className="space-y-1.5 flex flex-col items-center">
                    <img
                      src={signatureUrl}
                      alt="Signature"
                      className="w-28 h-14 object-contain rounded bg-white p-1 border border-cyan-500/60"
                    />
                    <span className="text-[10px] text-slate-400 truncate max-w-[140px]">{signatureName}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCropperModal({
                          isOpen: true,
                          imageUrl: signatureUrl,
                          target: 'signature',
                          preset: 'signature',
                          title: 'Crop Signature (স্বাক্ষর/সই ক্রপ)'
                        })}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <CropIcon className="w-3 h-3" />
                        <span>Crop (স্বাক্ষর)</span>
                      </button>
                      <span className="text-slate-600">·</span>
                      <button
                        type="button"
                        onClick={() => { setSignatureUrl(null); setSignatureName(''); }}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center py-3 w-full border border-dashed border-slate-700 hover:border-cyan-500 rounded-lg transition-colors">
                    <FileText className="w-6 h-6 text-slate-500 mb-1" />
                    <span className="text-[11px] text-cyan-400 font-medium">Upload Signature</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">JPG / PNG / Crop</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Document / Aadhaar Copy Upload */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-semibold text-slate-300 mb-2">ID Proof / Aadhaar Copy</span>
                {documentUrl ? (
                  <div className="space-y-1.5 flex flex-col items-center">
                    <FileText className="w-8 h-8 text-emerald-400" />
                    <span className="text-[10px] text-slate-300 truncate max-w-[140px] font-medium">{documentName}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCropperModal({
                          isOpen: true,
                          imageUrl: documentUrl,
                          target: 'document',
                          preset: 'free',
                          title: 'Crop Document (ডকুমেন্ট ক্রপ)'
                        })}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <CropIcon className="w-3 h-3" />
                        <span>Crop</span>
                      </button>
                      <span className="text-slate-600">·</span>
                      <button
                        type="button"
                        onClick={() => { setDocumentUrl(null); setDocumentName(''); }}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center py-3 w-full border border-dashed border-slate-700 hover:border-cyan-500 rounded-lg transition-colors">
                    <Upload className="w-6 h-6 text-slate-500 mb-1" />
                    <span className="text-[11px] text-cyan-400 font-medium">Upload Document</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">PDF or Image Scan</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Pricing, Advance & Khata Integration */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
            <h4 className="font-semibold text-slate-200 flex items-center justify-between">
              <span>Billing & Khata / ফি ও বাকি হিসাব</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Auto-syncs with Customer Khata Ledger
              </span>
            </h4>

            {/* Quick Discount Selector: 0%, 5%, 10%, 15%, 20% */}
            <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Quick Discount / ডিসকাউন্ট:</span>
              <div className="flex items-center gap-1.5">
                {[0, 5, 10, 15, 20].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleApplyDiscount(pct)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                      appliedDiscountPct === pct
                        ? 'bg-cyan-400 text-slate-950 shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Total Service Fee ({settings.currencySymbol})</label>
                <input
                  type="number"
                  required
                  value={totalFee}
                  onChange={(e) => setTotalFee(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono text-sm font-bold rounded-lg px-3 py-1.5 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Advance Received ({settings.currencySymbol})</label>
                <input
                  type="number"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-sm font-bold rounded-lg px-3 py-1.5 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Due Amount / বাকি ({settings.currencySymbol})</label>
                <div className={`w-full py-1.5 px-3 rounded-lg border font-mono text-sm font-bold flex items-center justify-between ${
                  dueAmount > 0
                    ? 'bg-rose-950/30 border-rose-800/60 text-rose-400'
                    : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-400'
                }`}>
                  <span>{settings.currencySymbol}{dueAmount.toFixed(2)}</span>
                  <span className="text-[10px] font-sans font-normal">
                    {dueAmount > 0 ? 'Will Add to Khata' : 'Full Paid ✓'}
                  </span>
                </div>
              </div>
            </div>

            {/* UPI QR & Payment Receipt Cropping Section */}
            {parsedAdvance > 0 && (
              <div className="p-3 rounded-xl border border-emerald-800/60 bg-emerald-950/20 space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-xs text-emerald-300">
                      UPI Payment & Receipt Verification (পেমেন্ট QR ও স্লিপ ক্রপ)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('upi')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        paymentMode === 'upi' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      UPI / QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('cash')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        paymentMode === 'cash' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Cash
                    </button>
                  </div>
                </div>

                {paymentMode === 'upi' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    {/* Dynamic QR Display */}
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center shrink-0">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=8609550430@ybl%26pn=AFRINA%20INTERNET%20CAFE%26am=${parsedAdvance}%26cu=INR`}
                          alt="UPI QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-[11px] space-y-0.5">
                        <div className="font-bold text-white">AFRINA INTERNET CAFE</div>
                        <div className="font-mono text-cyan-400 text-xs">8609550430@ybl</div>
                        <div className="text-[10px] text-slate-400">
                          Scan to pay: <strong className="text-emerald-400 font-mono">₹{parsedAdvance}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Payment Receipt / Screenshot Upload & Crop */}
                    <div className="flex flex-col justify-center">
                      {paymentProofUrl ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={paymentProofUrl}
                            alt="Payment Receipt"
                            className="w-12 h-14 object-cover rounded border border-emerald-500"
                          />
                          <div className="text-[11px] space-y-1">
                            <span className="text-emerald-400 font-semibold block">Receipt Cropped ✓</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setCropperModal({
                                  isOpen: true,
                                  imageUrl: paymentProofUrl,
                                  target: 'payment',
                                  preset: 'payment',
                                  title: 'Re-crop Payment Slip (পেমেন্ট স্লিপ ক্রপ)'
                                })}
                                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                              >
                                <CropIcon className="w-3 h-3" />
                                <span>Re-crop</span>
                              </button>
                              <span className="text-slate-600">·</span>
                              <button
                                type="button"
                                onClick={() => setPaymentProofUrl(null)}
                                className="text-[10px] text-rose-400 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer border border-dashed border-emerald-700/80 hover:border-emerald-400 bg-emerald-950/40 rounded-lg p-2.5 text-center flex items-center justify-center gap-2 transition-colors">
                          <CropIcon className="w-4 h-4 text-emerald-400" />
                          <span className="text-[11px] text-emerald-300 font-semibold">
                            + Upload & Crop Payment Screenshot
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePaymentProofUpload}
                            className="hidden"
                          />
                        </label>
                      )}

                      {/* UTR Number Input */}
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="UPI Ref / UTR No (e.g. 40291823901)"
                          value={paymentUtr}
                          onChange={(e) => setPaymentUtr(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono text-[11px] rounded-md px-2.5 py-1 focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Application / Token Number if available */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 mb-1">
                  Portal Ack / Token Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. NSDL Ack / NVSP Ref / UIDAI SRN"
                  value={ackNumber}
                  onChange={(e) => setAckNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Customer Note / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Urgent for college admission..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Create Seva Order / কাজ যুক্ত করুন</span>
            </button>
          </div>

        </form>

        {/* In-app Image Cropper Modal */}
        {cropperModal && cropperModal.isOpen && (
          <ImageCropperModal
            imageUrl={cropperModal.imageUrl}
            preset={cropperModal.preset}
            title={cropperModal.title}
            onCrop={handleCropComplete}
            onClose={() => setCropperModal(null)}
          />
        )}

      </div>
    </div>
  );
};
