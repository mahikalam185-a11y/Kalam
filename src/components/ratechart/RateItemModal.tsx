import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { RateChartCategory, RateChartItem } from '../../types';
import { X, Check, FileText } from 'lucide-react';

interface RateItemModalProps {
  editingItem?: RateChartItem | null;
  onClose: () => void;
}

export const RateItemModal: React.FC<RateItemModalProps> = ({ editingItem, onClose }) => {
  const { addRateChartItem, updateRateChartItem, settings } = useCyberCafe();

  const [category, setCategory] = useState<RateChartCategory>(editingItem?.category || 'pvc_cards');
  const [serviceName, setServiceName] = useState(editingItem?.serviceName || '');
  const [serviceNameBn, setServiceNameBn] = useState(editingItem?.serviceNameBn || '');
  const [customerRate, setCustomerRate] = useState(editingItem?.customerRate.toString() || '70');
  const [govtFee, setGovtFee] = useState(editingItem?.govtFee?.toString() || '0');
  const [durationDays, setDurationDays] = useState(editingItem?.durationDays || 'Same Day');
  const [docsInput, setDocsInput] = useState(editingItem?.requiredDocuments.join(', ') || 'Aadhaar Card, Mobile OTP');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    const docs = docsInput.split(',').map(d => d.trim()).filter(Boolean);
    const parsedRate = parseFloat(customerRate) || 0;
    const parsedGovt = parseFloat(govtFee) || 0;

    if (editingItem) {
      updateRateChartItem(editingItem.id, {
        category,
        serviceName: serviceName.trim(),
        serviceNameBn: serviceNameBn.trim() || undefined,
        customerRate: parsedRate,
        govtFee: parsedGovt,
        durationDays: durationDays.trim(),
        requiredDocuments: docs
      });
    } else {
      addRateChartItem({
        category,
        serviceName: serviceName.trim(),
        serviceNameBn: serviceNameBn.trim() || undefined,
        customerRate: parsedRate,
        govtFee: parsedGovt,
        durationDays: durationDays.trim(),
        requiredDocuments: docs,
        isPopular: false
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              {editingItem ? 'Edit Service Rate / রেট সংশোধন' : 'Add New Service Rate / নতুন রেট যুক্ত করুন'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block text-slate-300 font-medium mb-1">Rate Category / ক্যাটাগরি</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RateChartCategory)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500"
            >
              <option value="pvc_cards">PVC Smart Cards (Aadhaar, Voter, PAN)</option>
              <option value="driving_licence">Driving Licence (DL, LL, Parivahan)</option>
              <option value="pan_services">PAN Card Services (49A, Correction)</option>
              <option value="voter_services">Voter Card Services (Form 6, 8, EPIC)</option>
              <option value="aadhaar_services">Aadhaar Services (Download, Update)</option>
              <option value="online_forms">Online Govt & Job Forms</option>
              <option value="print_xerox">Xerox, Photo & Lamination</option>
              <option value="banking_bill">Banking, Bills & Railway</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Service Name (English) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ayushman Bharat Golden Card PVC"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Bengali Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. আয়ুষ্মান কার্ড পিভিসি"
                value={serviceNameBn}
                onChange={(e) => setServiceNameBn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Customer Rate ({settings.currencySymbol}) *</label>
              <input
                type="number"
                step="1"
                required
                value={customerRate}
                onChange={(e) => setCustomerRate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-sm font-bold rounded-lg px-3 py-1.5 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Govt Official Fee (if any)</label>
              <input
                type="number"
                step="1"
                value={govtFee}
                onChange={(e) => setGovtFee(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 font-mono rounded-lg px-3 py-1.5 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Delivery Time</label>
              <input
                type="text"
                placeholder="e.g. Same Day / 7 Days"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">
              Required Documents (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Aadhaar Card, Passport Photo, Mobile for OTP"
              value={docsInput}
              onChange={(e) => setDocsInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{editingItem ? 'Save Changes' : 'Add to Rate Chart'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
