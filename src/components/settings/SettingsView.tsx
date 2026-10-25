import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import {
  Settings,
  Building,
  Wifi,
  Coins,
  Printer,
  RotateCcw,
  Check,
  AlertTriangle
} from 'lucide-react';

const STATION_BANNER = '/src/assets/images/cyber_cafe_station_1792901834929.jpg';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDemoData
  } = useCyberCafe();

  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    resetToDemoData();
    setConfirmReset(false);
    setFormData(settings);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Banner Card */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md">
        <div className="h-44 sm:h-52 w-full relative">
          <img
            src={STATION_BANNER}
            alt="Cyber Cafe Station"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {formData.cafeName}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {formData.tagline} · {formData.address}
              </p>
            </div>
            <div className="hidden sm:block text-right text-xs text-slate-300 font-mono">
              <span className="text-cyan-400 font-semibold">Wi-Fi:</span> {formData.wifiSsid}
            </div>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs rounded-lg flex items-center justify-between animate-in fade-in">
          <span>✓ Settings updated successfully across the business suite.</span>
          <button onClick={() => setSavedSuccess(false)}>✕</button>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Business Identity & Wi-Fi */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-400" />
            <span>Business Profile & Guest Access</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Cyber Cafe Brand Name</label>
              <input
                type="text"
                value={formData.cafeName}
                onChange={(e) => setFormData({ ...formData, cafeName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Physical Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Guest Wi-Fi SSID</label>
              <input
                type="text"
                value={formData.wifiSsid}
                onChange={(e) => setFormData({ ...formData, wifiSsid: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Guest Wi-Fi Password (Printed on Receipts)</label>
              <input
                type="text"
                value={formData.wifiPassword}
                onChange={(e) => setFormData({ ...formData, wifiPassword: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Financial & Tax Rules */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>Financial & Billing Rules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Sales Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.taxRatePct}
                onChange={(e) => setFormData({ ...formData, taxRatePct: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Grace Period (Minutes)</label>
              <input
                type="number"
                value={formData.gracePeriodMinutes}
                onChange={(e) => setFormData({ ...formData, gracePeriodMinutes: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Printing Rates */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Document & Print Service Rates</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">B&W Print Rate ($/page)</label>
              <input
                type="number"
                step="0.05"
                value={formData.monochromePrintRate}
                onChange={(e) => setFormData({ ...formData, monochromePrintRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Color Laser Print ($/page)</label>
              <input
                type="number"
                step="0.05"
                value={formData.colorPrintRate}
                onChange={(e) => setFormData({ ...formData, colorPrintRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Document Scan Rate ($/doc)</label>
              <input
                type="number"
                step="0.05"
                value={formData.scanRate}
                onChange={(e) => setFormData({ ...formData, scanRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400">Restore all starter demo data?</span>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded"
              >
                Yes, Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Demo Data</span>
            </button>
          )}

          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
};
