import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { X, UserPlus, Check } from 'lucide-react';

export const NewKhataCustomerModal: React.FC = () => {
  const { activeModal, closeModal, addKhataCustomer } = useCyberCafe();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [notes, setNotes] = useState('');

  if (activeModal !== 'newKhataCustomer') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addKhataCustomer({
      name: name.trim(),
      phone: phone.trim() || '+91 98000 00000',
      village: village.trim() || 'Local Area',
      notes: notes.trim() || undefined
    });

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Add New Khata Customer / নতুন খাতা অ্যাকাউন্ট
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Customer Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Bimal Halder (Teacher)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Mobile Number</label>
            <input
              type="tel"
              placeholder="+91 98322 00000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Village / Para / Location</label>
            <input
              type="text"
              placeholder="e.g. Gobindapur High School Para"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Customer Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. School exam xerox customer, monthly settlement"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500"
            />
          </div>

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
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save Khata Account</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
