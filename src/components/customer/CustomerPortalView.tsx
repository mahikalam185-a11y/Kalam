import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { ServiceCategory, RateChartItem, ServiceOrder } from '../../types';
import {
  Upload,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  Search,
  Camera,
  Image,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Copy,
  Printer,
  Sparkles,
  ExternalLink,
  Phone,
  MapPin,
  Car,
  Crop as CropIcon
} from 'lucide-react';
import { ImageCropperModal, CropPreset } from '../common/ImageCropperModal';

export const CustomerPortalView: React.FC = () => {
  const {
    rateChart,
    serviceOrders,
    addServiceOrder,
    settings,
    setActiveTab
  } = useCyberCafe();

  const [activePortalTab, setActivePortalTab] = useState<'apply' | 'rates' | 'track'>('apply');

  // Application Form State
  const [selectedRateItem, setSelectedRateItem] = useState<RateChartItem | null>(() => {
    const defaultLL = rateChart.find(r => r.id === 'rc-ll-1' || r.serviceName.includes('Learner Licence'));
    return defaultLL || rateChart[0] || null;
  });

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerVillage, setCustomerVillage] = useState('');
  const [notes, setNotes] = useState('');
  const [advancePaid, setAdvancePaid] = useState<string>('0');
  const [payAtCounter, setPayAtCounter] = useState(true);

  // Uploaded Files State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [documentFileName, setDocumentFileName] = useState<string>('');

  // Payment Proof & Cropper State
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [paymentUtr, setPaymentUtr] = useState<string>('');
  const [cropperModal, setCropperModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    target: 'photo' | 'signature' | 'document' | 'payment';
    preset: CropPreset;
    title: string;
  } | null>(null);

  // Submitted Order Result Modal
  const [submittedOrder, setSubmittedOrder] = useState<ServiceOrder | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Tracking Search State
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedOrders, setTrackedOrders] = useState<ServiceOrder[] | null>(null);

  // Rate Chart Search inside Portal
  const [rateSearch, setRateSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | string>('all');

  const filteredRates = rateChart.filter(item => {
    if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) return false;
    if (rateSearch.trim()) {
      const q = rateSearch.toLowerCase();
      return (
        item.serviceName.toLowerCase().includes(q) ||
        (item.serviceNameBn && item.serviceNameBn.toLowerCase().includes(q)) ||
        item.requiredDocuments.some(d => d.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Handle Photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Signature upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Document upload
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawUrl = reader.result as string;
        setCropperModal({
          isOpen: true,
          imageUrl: rawUrl,
          target: 'payment',
          preset: 'payment',
          title: 'Crop UPI Payment Screenshot / UTR Slip (পেমেন্ট স্লিপ ক্রপ করুন)'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBase64: string) => {
    if (!cropperModal) return;
    if (cropperModal.target === 'photo') {
      setPhotoPreview(croppedBase64);
    } else if (cropperModal.target === 'signature') {
      setSignaturePreview(croppedBase64);
    } else if (cropperModal.target === 'document') {
      setDocumentPreview(croppedBase64);
    } else if (cropperModal.target === 'payment') {
      setPaymentProofPreview(croppedBase64);
    }
    setCropperModal(null);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !selectedRateItem) return;

    const totalFee = selectedRateItem.customerRate;
    const advance = payAtCounter ? 0 : (parseFloat(advancePaid) || 0);
    const dueAmount = Math.max(0, totalFee - advance);

    const newOrder = addServiceOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerVillage: customerVillage.trim() || undefined,
      serviceCategory: selectedRateItem.category as ServiceCategory,
      serviceName: selectedRateItem.serviceName,
      status: 'received',
      totalFee,
      advancePaid: advance,
      dueAmount,
      paymentStatus: dueAmount === 0 ? 'paid' : (advance > 0 ? 'partial' : 'due'),
      photoUrl: photoPreview || undefined,
      signatureUrl: signaturePreview || undefined,
      documentUrl: documentPreview || undefined,
      documentFileName: documentFileName || undefined,
      paymentProofUrl: paymentProofPreview || undefined,
      paymentUtr: paymentUtr.trim() || undefined,
      paymentMode: payAtCounter ? 'due' : 'upi',
      notes: notes.trim() ? `[Online Citizen Order]: ${notes.trim()}` : '[Online Citizen Order via Public Portal]',
      isOnlineOrder: true
    });

    setSubmittedOrder(newOrder);

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerVillage('');
    setNotes('');
    setAdvancePaid('0');
    setPhotoPreview(null);
    setSignaturePreview(null);
    setDocumentPreview(null);
    setDocumentFileName('');
    setPaymentProofPreview(null);
    setPaymentUtr('');
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upiQrId || '8609550430@ybl');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    const q = trackQuery.trim().toLowerCase();
    const matches = serviceOrders.filter(
      o => o.tokenNumber.toLowerCase().includes(q) || o.customerPhone.includes(q) || o.customerName.toLowerCase().includes(q)
    );
    setTrackedOrders(matches);
  };

  const selectServiceForApplication = (item: RateChartItem) => {
    setSelectedRateItem(item);
    setActivePortalTab('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      
      {/* Citizen Public Portal Hero Header */}
      <div className="rounded-2xl border border-cyan-800/40 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Digital Seva Kendra & Cyber Cafe Official Public Portal</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {settings.cafeName}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              অনলাইনে লার্নার লাইসেন্স (LL), ভোটার, প্যান কার্ড, আধার পিভিসি ও সরকারি চাকরির ফর্ম আবেদন করুন এবং আপনার ডকুমেন্টস ও ফটো আপলোড করুন।
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 font-medium">
              <span className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{settings.address}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-slate-300 font-mono">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{settings.phone}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-amber-300 font-mono">
                <QrCode className="w-3.5 h-3.5" />
                <span>UPI ID: {settings.upiQrId || '8609550430@ybl'}</span>
              </span>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => setActivePortalTab('apply')}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer ${
                activePortalTab === 'apply'
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold shadow-cyan-400/20'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>অনলাইনে কাজের আবেদন ও ফাইল আপলোড</span>
            </button>

            <button
              onClick={() => setActivePortalTab('rates')}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer ${
                activePortalTab === 'rates'
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold shadow-cyan-400/20'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>পাবলিশড সার্ভিস রেট চার্ট (Rate Chart)</span>
            </button>

            <button
              onClick={() => setActivePortalTab('track')}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer ${
                activePortalTab === 'track'
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold shadow-cyan-400/20'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>কাজের স্ট্যাটাস ট্র্যাক করুন (Track Order)</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Online Application & Document Upload Form */}
      {activePortalTab === 'apply' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Form (8 Cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7 shadow-xl space-y-6">
            
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span>New Work Application & Document Upload (অনলাইন কাজের আবেদন)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Fill your details, select your service, and upload your documents. The cafe admin will review and process your order immediately.
              </p>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-5 text-xs">
              
              {/* Service Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  1. Select Work / Service (কাজের সেবা নির্বাচন করুন) *
                </label>
                <select
                  value={selectedRateItem?.id || ''}
                  onChange={(e) => {
                    const item = rateChart.find(r => r.id === e.target.value);
                    if (item) setSelectedRateItem(item);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm font-medium rounded-xl px-3.5 py-2.5 focus:border-cyan-500 focus:outline-none"
                >
                  <optgroup label="🚗 Learner Licence (LL) & Driving Licence">
                    {rateChart.filter(r => r.category === 'driving_licence').map(r => (
                      <option key={r.id} value={r.id}>
                        {r.serviceName} {r.serviceNameBn ? `(${r.serviceNameBn})` : ''} — ₹{r.customerRate}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="💳 PVC Smart Cards">
                    {rateChart.filter(r => r.category === 'pvc_cards').map(r => (
                      <option key={r.id} value={r.id}>
                        {r.serviceName} — ₹{r.customerRate}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🆔 PAN Card Services">
                    {rateChart.filter(r => r.category === 'pan_services').map(r => (
                      <option key={r.id} value={r.id}>
                        {r.serviceName} — ₹{r.customerRate}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🗳️ Voter ID Services">
                    {rateChart.filter(r => r.category === 'voter_services').map(r => (
                      <option key={r.id} value={r.id}>
                        {r.serviceName} — ₹{r.customerRate}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="📄 Other Forms & Services">
                    {rateChart.filter(r => !['driving_licence', 'pvc_cards', 'pan_services', 'voter_services'].includes(r.category)).map(r => (
                      <option key={r.id} value={r.id}>
                        {r.serviceName} — ₹{r.customerRate}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Selected Service Quick Preview Card */}
              {selectedRateItem && (
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                      <span>{selectedRateItem.serviceName}</span>
                      {selectedRateItem.serviceName.includes('Learner Licence') && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          LL Service
                        </span>
                      )}
                    </div>
                    {selectedRateItem.serviceNameBn && (
                      <div className="text-cyan-300 text-xs mt-0.5">{selectedRateItem.serviceNameBn}</div>
                    )}
                    <div className="text-slate-400 text-[11px] mt-1">
                      Required Documents: <span className="text-slate-300">{selectedRateItem.requiredDocuments.join(', ')}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-slate-400 text-[11px]">Total Fee / ফি</div>
                    <div className="font-mono text-xl font-bold text-emerald-400">
                      {settings.currencySymbol}{selectedRateItem.customerRate.toFixed(2)}
                    </div>
                    <div className="text-slate-500 text-[10px]">
                      Time: {selectedRateItem.durationDays || 'Same Day'}
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Customer Full Name (আপনার নাম) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Das"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 focus:border-cyan-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Mobile Number (মোবাইল নম্বর) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98321 00000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Village / Town / Address (গ্রাম / ওয়ার্ড / ঠিকানা)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Krishnapur, Ward 3"
                  value={customerVillage}
                  onChange={(e) => setCustomerVillage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2 focus:border-cyan-500"
                />
              </div>

              {/* 3. Document Upload Section (Photos, Signature, Docs) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-200 font-semibold text-sm">
                    2. Upload Documents & Photos (ডকুমেন্টস ও ছবি আপলোড করুন)
                  </label>
                  <span className="text-[11px] text-cyan-400">Supported: JPG, PNG, PDF, Mobile Photos</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Photo Upload */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-300 font-medium text-xs mb-1">
                        <Camera className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Passport Photo / কাস্টমার ছবি</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Selfie or passport picture</p>
                    </div>

                    {photoPreview ? (
                      <div className="relative group rounded-lg overflow-hidden border border-cyan-800/80 bg-slate-900 h-28 flex items-center justify-center">
                        <img src={photoPreview} alt="Customer Photo" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setCropperModal({
                              isOpen: true,
                              imageUrl: photoPreview,
                              target: 'photo',
                              preset: 'passport',
                              title: 'Crop Passport Photo (পাসপোর্ট সাইজ ক্রপ)'
                            })}
                            className="px-2 py-1 bg-cyan-500 text-slate-950 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer"
                          >
                            <CropIcon className="w-3 h-3" />
                            <span>Crop</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoPreview(null)}
                            className="px-2 py-1 bg-rose-900 text-rose-200 font-semibold text-[10px] rounded cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="h-28 rounded-lg border-2 border-dashed border-slate-800 hover:border-cyan-500/60 bg-slate-900/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors p-2 text-center">
                        <Camera className="w-6 h-6 text-slate-500" />
                        <span className="text-[11px] text-cyan-400 font-medium">+ Choose Photo</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Signature Upload */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-300 font-medium text-xs mb-1">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Signature / স্বাক্ষর</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Sign on white paper & click photo</p>
                    </div>

                    {signaturePreview ? (
                      <div className="relative group rounded-lg overflow-hidden border border-amber-800/80 bg-slate-900 h-28 flex items-center justify-center">
                        <img src={signaturePreview} alt="Signature" className="max-h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setCropperModal({
                              isOpen: true,
                              imageUrl: signaturePreview,
                              target: 'signature',
                              preset: 'signature',
                              title: 'Crop Signature (স্বাক্ষর ক্রপ)'
                            })}
                            className="px-2 py-1 bg-amber-400 text-slate-950 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer"
                          >
                            <CropIcon className="w-3 h-3" />
                            <span>Crop</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSignaturePreview(null)}
                            className="px-2 py-1 bg-rose-900 text-rose-200 font-semibold text-[10px] rounded cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="h-28 rounded-lg border-2 border-dashed border-slate-800 hover:border-amber-500/60 bg-slate-900/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors p-2 text-center">
                        <FileText className="w-6 h-6 text-slate-500" />
                        <span className="text-[11px] text-amber-400 font-medium">+ Upload Signature</span>
                        <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Aadhaar / Document Proof */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-300 font-medium text-xs mb-1">
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ID / Aadhaar / Document</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Aadhaar card, admit, marksheet</p>
                    </div>

                    {documentPreview ? (
                      <div className="relative group rounded-lg overflow-hidden border border-emerald-800/80 bg-slate-900 h-28 flex flex-col items-center justify-center p-2 text-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
                        <span className="text-[10px] text-slate-200 line-clamp-1 font-mono">{documentFileName || 'Document Attached'}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setCropperModal({
                              isOpen: true,
                              imageUrl: documentPreview,
                              target: 'document',
                              preset: 'free',
                              title: 'Crop Document (ডকুমেন্ট ক্রপ)'
                            })}
                            className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <CropIcon className="w-3 h-3" />
                            <span>Crop</span>
                          </button>
                          <span className="text-slate-600">·</span>
                          <button
                            type="button"
                            onClick={() => {
                              setDocumentPreview(null);
                              setDocumentFileName('');
                            }}
                            className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="h-28 rounded-lg border-2 border-dashed border-slate-800 hover:border-emerald-500/60 bg-slate-900/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors p-2 text-center">
                        <Upload className="w-6 h-6 text-slate-500" />
                        <span className="text-[11px] text-emerald-400 font-medium">+ Choose Document</span>
                        <input type="file" accept="image/*,application/pdf" onChange={handleDocumentUpload} className="hidden" />
                      </label>
                    )}
                  </div>

                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Specific Requirements / Notes (কোনো বিশেষ নির্দেশ থাকলে লিখুন)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Need urgent delivery, slot booking for morning time, blood group O+..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2 focus:border-cyan-500 text-xs"
                />
              </div>

              {/* Payment Option */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Payment Option / পেমেন্ট অপশন</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payAtCounter}
                        onChange={(e) => setPayAtCounter(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-400 focus:ring-0"
                      />
                      <span>Pay at Counter during Delivery (ডেলিভারির সময় ক্যাশ পেমেন্ট)</span>
                    </label>
                  </div>
                </div>

                {!payAtCounter && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
                    <div>
                      <label className="block text-slate-400 text-xs mb-1">Advance Amount to Pay (অগ্রিম টাকা)</label>
                      <input
                        type="number"
                        step="1"
                        placeholder="50"
                        value={advancePaid}
                        onChange={(e) => setAdvancePaid(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono rounded-lg px-3 py-2 text-sm font-bold"
                      />
                      
                      {/* Real Dynamic QR Display */}
                      <div className="mt-3 flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="w-16 h-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=8609550430@ybl%26pn=AFRINA%20INTERNET%20CAFE%26am=${advancePaid || '50'}%26cu=INR`}
                            alt="UPI QR Code"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-[11px] space-y-0.5">
                          <div className="text-slate-400">Scan & Pay via PhonePe/GPay:</div>
                          <div className="font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                            <span>8609550430@ybl</span>
                            <button type="button" onClick={handleCopyUpi} className="text-cyan-400 hover:text-cyan-300">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {copiedUpi && <span className="text-emerald-400 text-[10px]">Copied UPI!</span>}
                        </div>
                      </div>
                    </div>

                    {/* Crop Payment Slip and UTR Entry */}
                    <div className="space-y-3">
                      <label className="block text-slate-400 text-xs">
                        Crop & Attach Payment Slip (পেমেন্ট স্লিপ ক্রপ করুন) *
                      </label>

                      {paymentProofPreview ? (
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/80 flex items-center gap-3">
                          <img
                            src={paymentProofPreview}
                            alt="Cropped Payment Slip"
                            className="w-14 h-16 object-cover rounded border border-emerald-400"
                          />
                          <div className="space-y-1 text-xs">
                            <span className="text-emerald-300 font-bold block">Payment Slip Cropped ✓</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setCropperModal({
                                  isOpen: true,
                                  imageUrl: paymentProofPreview,
                                  target: 'payment',
                                  preset: 'payment',
                                  title: 'Re-crop Payment Slip (পেমেন্ট স্লিপ ক্রপ)'
                                })}
                                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                              >
                                <CropIcon className="w-3 h-3" />
                                <span>Re-crop</span>
                              </button>
                              <span className="text-slate-600">·</span>
                              <button
                                type="button"
                                onClick={() => setPaymentProofPreview(null)}
                                className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer border-2 border-dashed border-emerald-600/80 hover:border-emerald-400 bg-emerald-950/30 rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1 transition-colors">
                          <CropIcon className="w-5 h-5 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-300">
                            + Upload & Crop Payment Screenshot
                          </span>
                          <span className="text-[10px] text-slate-400">
                            PhonePe / GPay পেমেন্ট রিসিট ক্রপ করে আপলোড দিন
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePaymentProofUpload}
                            className="hidden"
                          />
                        </label>
                      )}

                      {/* UTR Input */}
                      <div>
                        <input
                          type="text"
                          placeholder="UPI Ref / UTR No (e.g. 40291823901)"
                          value={paymentUtr}
                          onChange={(e) => setPaymentUtr(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono rounded-lg px-3 py-1.5 text-xs focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-xl transition-all shadow-lg shadow-cyan-400/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>Submit Work Order & Upload Documents (আবেদন জমা দিন)</span>
                </button>
              </div>

            </form>

          </div>

          {/* Right Side: Process Info & Quick Guidance (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>How Online Application Works (কাজের নিয়ম)</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80 flex items-center justify-center font-bold text-[10px] shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-white">আবেদন জমা দিন:</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">আপনার নাম, মোবাইল নম্বর দিয়ে প্রয়োজনীয় ডকুমেন্ট আপলোড করুন।</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80 flex items-center justify-center font-bold text-[10px] shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-white">টোকেন নম্বর পান:</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">আবেদন জমা হওয়া মাত্রই তাৎক্ষণিক ডিজিটাল রসিদ ও ট্র্যাকিং নম্বর পাবেন।</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80 flex items-center justify-center font-bold text-[10px] shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-white">অ্যাডমিন প্রসেসিং ও ডেলিভারি:</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">ক্যাফে অ্যাডমিন আবেদনটি সম্পন্ন করে প্রিন্ট রেডি করবেন এবং আপনাকে এসএমএস/হোয়াটসঅ্যাপে জানিয়ে দেবেন।</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Contact & UPI Box */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <h4 className="font-semibold text-slate-200 text-xs">Direct Support & Counter Delivery</h4>
              <div className="text-xs text-slate-400 space-y-1.5">
                <div>🏢 <span className="text-slate-200 font-medium">{settings.cafeName}</span></div>
                <div>📍 <span>{settings.address}</span></div>
                <div>📞 <span className="text-emerald-400 font-mono font-semibold">{settings.phone}</span></div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActivePortalTab('rates')}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Check All Service Rates (রেট চার্ট)</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: Published Rate Chart View */}
      {activePortalTab === 'rates' && (
        <div className="space-y-4">
          
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <span>Official Published Service Rate Chart / অফিসিয়াল রেট চার্ট</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Transparent and verified government & cyber cafe service charges for citizens
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search service, LL, Driving, PAN..."
                value={rateSearch}
                onChange={(e) => setRateSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Quick Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'all', label: 'All Services (সব)' },
              { id: 'driving_licence', label: '🚗 Learner Licence (LL) & DL' },
              { id: 'pvc_cards', label: '💳 PVC Plastic Cards' },
              { id: 'pan_services', label: '🆔 PAN Card Services' },
              { id: 'voter_services', label: '🗳️ Voter ID Services' },
              { id: 'aadhaar_services', label: '📄 Aadhaar Services' },
              { id: 'online_forms', label: '📝 Online Govt Forms' },
              { id: 'print_xerox', label: '🖨️ Print & Xerox' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium shrink-0 ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Rates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRates.map(item => {
              const isLL = item.serviceName.toLowerCase().includes('learner') || item.id.includes('ll');

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isLL
                      ? 'border-amber-500/40 bg-gradient-to-br from-slate-900 to-amber-950/20'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-bold text-slate-100 text-sm leading-snug">
                        {item.serviceName}
                      </div>
                      {isLL && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 shrink-0">
                          LL
                        </span>
                      )}
                    </div>

                    {item.serviceNameBn && (
                      <div className="text-cyan-400/90 text-xs font-medium mb-2">
                        {item.serviceNameBn}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 space-y-1 mb-2">
                      <div>
                        <span className="text-slate-500 font-medium">Documents: </span>
                        <span>{item.requiredDocuments.join(' · ')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Ready in: {item.durationDays || 'Same Day'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-lg font-bold text-emerald-400">
                        {settings.currencySymbol}{item.customerRate.toFixed(2)}
                      </div>
                      {item.govtFee && item.govtFee > 0 ? (
                        <div className="text-[10px] text-slate-500">Govt Fee: ₹{item.govtFee}</div>
                      ) : null}
                    </div>

                    <button
                      onClick={() => selectServiceForApplication(item)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      <span>Apply Online</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 3: Track Application Status */}
      {activePortalTab === 'track' && (
        <div className="max-w-2xl mx-auto space-y-6">
          
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 text-center space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center justify-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              <span>Track Your Application Status (কাজের স্ট্যাটাস চেক করুন)</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Enter your Token Number (e.g. SEVA-1049) or Mobile Number to view live progress of your work order.
            </p>

            <form onSubmit={handleTrackSearch} className="flex gap-2 max-w-md mx-auto">
              <input
                type="text"
                required
                placeholder="Enter Mobile No or Token (SEVA-XXXX)"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors cursor-pointer"
              >
                Track
              </button>
            </form>
          </div>

          {/* Tracked Orders Display */}
          {trackedOrders && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-300 text-xs">Search Results ({trackedOrders.length})</h3>
              {trackedOrders.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                  No applications found matching "{trackQuery}". Please double check your mobile number or token.
                </div>
              ) : (
                trackedOrders.map(order => (
                  <div key={order.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-cyan-400 font-bold text-xs">{order.tokenNumber}</span>
                        <h4 className="font-bold text-slate-100 text-sm mt-0.5">{order.serviceName}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        order.status === 'delivered'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : order.status === 'printed_ready'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-2.5 rounded-lg bg-slate-950 text-slate-400">
                      <div>
                        <span className="text-slate-500 block">Customer</span>
                        <span className="text-slate-200 font-medium">{order.customerName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Total Fee</span>
                        <span className="font-mono text-slate-200">{settings.currencySymbol}{order.totalFee}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Advance Paid</span>
                        <span className="font-mono text-emerald-400">{settings.currencySymbol}{order.advancePaid}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Remaining Due</span>
                        <span className="font-mono text-rose-400">{settings.currencySymbol}{order.dueAmount}</span>
                      </div>
                    </div>

                    {order.ackNumber && (
                      <div className="text-xs text-cyan-300 font-mono bg-cyan-950/40 p-2 rounded border border-cyan-900/60">
                        Official Ref / Ack No: <span className="font-bold">{order.ackNumber}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      )}

      {/* Confirmation Slip Modal when Order is submitted */}
      {submittedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-emerald-800/80 bg-slate-900 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">
                Application Submitted Successfully! (আবেদন সম্পন্ন)
              </h3>
              <p className="text-xs text-slate-400">
                Your order has been sent to {settings.cafeName}. Please save your Token Number.
              </p>
            </div>

            {/* Token Badge */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Your Tracking Token</span>
              <div className="font-mono text-2xl font-extrabold text-cyan-400 tracking-wider">
                {submittedOrder.tokenNumber}
              </div>
              <div className="text-[11px] text-slate-300 font-medium">{submittedOrder.serviceName}</div>
            </div>

            {/* Order Financials */}
            <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] block">Customer Name</span>
                <span className="font-medium text-slate-200">{submittedOrder.customerName}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[10px] block">Total Service Fee</span>
                <span className="font-mono font-bold text-emerald-400">{settings.currencySymbol}{submittedOrder.totalFee.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Payment Mode</span>
                <span className="text-slate-300">{submittedOrder.dueAmount > 0 ? 'Pay at Counter' : 'Fully Paid'}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[10px] block">Due on Delivery</span>
                <span className="font-mono font-bold text-rose-400">{settings.currencySymbol}{submittedOrder.dueAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* UPI QR Display for Advance Payment if applicable */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="text-[11px] text-slate-400">
                You can pay via UPI anytime: <span className="font-mono font-bold text-white">{settings.upiQrId || '8609550430@ybl'}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800 hover:bg-cyan-900/60 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedUpi ? 'Copied UPI!' : 'Copy UPI ID (8609550430@ybl)'}</span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSubmittedOrder(null)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Done / ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Image Cropper Modal for Citizen Portal */}
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
  );
};
