import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { Member } from '../../types';
import { X, UserPlus, ShieldCheck, Check } from 'lucide-react';

export const MemberModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    addMember
  } = useCyberCafe();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<Member['tier']>('Silver');
  const [initialDeposit, setInitialDeposit] = useState<string>('20.00');
  const [notes, setNotes] = useState('');

  if (activeModal !== 'member') return null;

  const getDiscountByTier = (selectedTier: Member['tier']) => {
    switch (selectedTier) {
      case 'VIP Diamond': return 15;
      case 'Gold': return 10;
      case 'Silver': return 5;
      case 'Bronze': return 0;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const discountPct = getDiscountByTier(tier);
    const balance = parseFloat(initialDeposit) || 0;

    addMember({
      name: name.trim(),
      phone: phone.trim() || '+1 (555) 000-0000',
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@user.net`,
      tier,
      discountPct,
      balance,
      notes: notes.trim()
    });

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Register New Cafe Member</h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Full Name / Gamer Tag</label>
              <input
                type="text"
                required
                placeholder="e.g. Liam 'Viper' Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="gamer@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Membership Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:border-cyan-500"
              >
                <option value="Bronze">Bronze (0% rate discount)</option>
                <option value="Silver">Silver (5% rate discount)</option>
                <option value="Gold">Gold (10% rate discount)</option>
                <option value="VIP Diamond">VIP Diamond (15% rate discount)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Initial Wallet Deposit ($)</label>
              <input
                type="number"
                step="5"
                placeholder="20.00"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Notes / Peripheral Preferences</label>
            <input
              type="text"
              placeholder="e.g. Brings own custom mousepad, prefers Station 02..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:border-cyan-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
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
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Register Member</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
