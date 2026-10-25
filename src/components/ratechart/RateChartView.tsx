import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { RateChartCategory, RateChartItem } from '../../types';
import { RateItemModal } from './RateItemModal';
import {
  FileText,
  CreditCard,
  Search,
  Plus,
  Printer,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';

export const RateChartView: React.FC = () => {
  const {
    rateChart,
    deleteRateChartItem,
    openModal,
    settings
  } = useCyberCafe();

  const [activeCategory, setActiveCategory] = useState<'all' | RateChartCategory>('all');
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<RateChartItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<RateChartItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredItems = rateChart.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = item.serviceName.toLowerCase().includes(q);
      const bnMatch = item.serviceNameBn?.toLowerCase().includes(q) || false;
      const docsMatch = item.requiredDocuments.some(d => d.toLowerCase().includes(q));
      return nameMatch || bnMatch || docsMatch;
    }
    return true;
  });

  const getCategoryTitle = (cat: RateChartCategory) => {
    switch (cat) {
      case 'driving_licence': return 'Learner Licence (LL) & Driving Licence / লার্নার ও ড্রাইভিং লাইসেন্স';
      case 'pvc_cards': return 'PVC Smart Card Printing / পিভিসি স্মার্ট কার্ড';
      case 'pan_services': return 'PAN Card Services / প্যান কার্ড সেবা';
      case 'voter_services': return 'Voter ID Services / ভোটার কার্ড সেবা';
      case 'aadhaar_services': return 'Aadhaar Services / আধার কার্ড সেবা';
      case 'online_forms': return 'Online Job & Govt Forms / অনলাইন ফর্ম ফিলাপ';
      case 'print_xerox': return 'Print, Xerox & Photos / প্রিন্ট ও জেরক্স';
      case 'banking_bill': return 'Banking, Bills & Railway / বিল পেমেন্ট';
    }
  };

  const handlePrintRateChart = () => {
    window.print();
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteRateChartItem(itemToDelete.id);
    setItemToDelete(null);
    setToastMessage('✓ Rate item deleted successfully from chart.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>Cyber Cafe Official Rate Chart / রেট চার্ট</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent pricing list for Aadhaar, Voter, Driving Licence, PAN cards, forms, and Xerox
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintRateChart}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Wall Chart</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Add Service Rate</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
        
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Services (সব)' },
            { id: 'driving_licence', label: '🚗 LL & Driving Licence (লার্নার ও ড্রাইভিং)' },
            { id: 'pvc_cards', label: 'PVC Cards' },
            { id: 'pan_services', label: 'PAN Card' },
            { id: 'voter_services', label: 'Voter ID' },
            { id: 'aadhaar_services', label: 'Aadhaar' },
            { id: 'online_forms', label: 'Online Forms' },
            { id: 'print_xerox', label: 'Print & Xerox' },
            { id: 'banking_bill', label: 'Bills & Travel' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                activeCategory === cat.id
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service name, document, LL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:border-cyan-500"
          />
        </div>

      </div>

      {/* Rate Chart Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-medium text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Service Name / কাজের বিবরণ</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Required Documents (প্রয়োজনীয় ডকুমেন্টস)</th>
                <th className="py-3 px-3">Delivery Time</th>
                <th className="py-3 px-4 text-right">Customer Fee / রেট</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredItems.map(item => {
                const isLL = item.serviceName.toLowerCase().includes('learner') || item.id.includes('ll');

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Service Name & Bengali subtitle */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 flex flex-wrap items-center gap-1.5">
                        <span>{item.serviceName}</span>
                        {isLL && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                            LL (লার্নার লাইসেন্স)
                          </span>
                        )}
                        {item.isPopular && (
                          <span className="text-[10px] text-amber-400 font-mono">
                            ★ Popular
                          </span>
                        )}
                      </div>
                      {item.serviceNameBn && (
                        <div className="text-[11px] text-cyan-400/90 mt-0.5">
                          {item.serviceNameBn}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="text-slate-400 capitalize">
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Documents */}
                    <td className="py-3 px-3 max-w-[280px]">
                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        {item.requiredDocuments.join(' · ')}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{item.durationDays || 'Instant'}</span>
                      </div>
                    </td>

                    {/* Rate */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <div className="text-base font-bold text-emerald-400">
                        {settings.currencySymbol}{item.customerRate.toFixed(2)}
                      </div>
                      {item.govtFee && item.govtFee > 0 ? (
                        <div className="text-[10px] text-slate-500">
                          (Govt: {settings.currencySymbol}{item.govtFee})
                        </div>
                      ) : null}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openModal('newOrder')}
                          title="Create order from this rate"
                          className="px-2.5 py-1 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors inline-flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <span>Take Order</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => setEditingItem(item)}
                          title="Edit rate"
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setItemToDelete(item)}
                          title="Delete from rate chart"
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-emerald-500/90 text-slate-950 px-4 py-2.5 rounded-xl font-medium text-xs shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal for Rate Item Deletion */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-rose-900/60 bg-slate-900 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/80 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                onClick={() => setItemToDelete(null)}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 text-sm">
                Delete Rate Item / রেট চার্ট থেকে মুছবেন?
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to remove <span className="text-white font-medium">"{itemToDelete.serviceName}"</span>?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-xs"
              >
                Delete / মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <RateItemModal
          editingItem={editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Add New Rate Modal */}
      {isAddModalOpen && (
        <RateItemModal
          editingItem={null}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

    </div>
  );
};
