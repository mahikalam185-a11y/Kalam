import React, { useState, useEffect } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { X, Check, Trash2, UserCheck } from 'lucide-react';

export const EditKhataCustomerModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    selectedKhataCustomerId,
    khataCustomers,
    updateKhataCustomer,
    deleteKhataCustomer
  } = useCyberCafe();

  const customer = khataCustomers.find(c => c.id === selectedKhataCustomerId);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setVillage(customer.village);
      setNotes(customer.notes || '');
    }
  }, [customer]);

  if (activeModal !== 'editKhataCustomer' || !customer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateKhataCustomer(customer.id, {
      name: name.trim(),
      phone: phone.trim() || customer.phone,
      village: village.trim() || 'Local Area',
      notes: notes.trim() || undefined
    });

    closeModal();
  };

  const handleDelete = () => {
    if (window.confirm(`Delete ${customer.name}'s Khata account and their ledger history?`)) {
      deleteKhataCustomer(customer.id);
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Edit Khata Customer / গ্রাহকের তথ্য সংশোধন
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Mobile Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Village / Para / Location</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Customer Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Khata</span>
            </button>

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
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
