import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { PosProduct } from '../../types';
import { X, Package, Plus, Search, Edit2, Check } from 'lucide-react';

export const InventoryManagerModal: React.FC = () => {
  const {
    products,
    updateProductStock,
    addProduct,
    updateProduct,
    activeModal,
    closeModal,
    settings
  } = useCyberCafe();

  const [search, setSearch] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form for new item
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<PosProduct['category']>('beverage');
  const [newPrice, setNewPrice] = useState('3.00');
  const [newCost, setNewCost] = useState('1.50');
  const [newStock, setNewStock] = useState('24');
  const [newUnit, setNewUnit] = useState('can');

  if (activeModal !== 'inventory') return null;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addProduct({
      name: newName.trim(),
      category: newCategory,
      price: parseFloat(newPrice) || 0,
      cost: parseFloat(newCost) || 0,
      stock: parseInt(newStock) || 0,
      unit: newUnit.trim() || 'item',
      iconName: 'Package'
    });

    setIsAddingNew(false);
    setNewName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Cafe Stock & Retail Inventory</h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isAddingNew ? 'Close Form' : 'Add New Product'}</span>
          </button>
        </div>

        {/* New Product Form Accordion */}
        {isAddingNew && (
          <form onSubmit={handleAddNew} className="p-4 bg-slate-950/80 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
            <div className="col-span-2">
              <label className="block text-slate-400 mb-1">Product Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Cold Brew 330ml"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1.5 focus:border-cyan-500"
              >
                <option value="beverage">Beverage</option>
                <option value="snack">Snack</option>
                <option value="meal">Meal</option>
                <option value="printing">Printing</option>
                <option value="accessory">Accessory</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Selling Price</label>
              <input
                type="number"
                step="0.05"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1.5 focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Stock</label>
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1.5 focus:border-cyan-500 font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Inventory Table */}
        <div className="max-h-[55vh] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-medium text-[11px] uppercase tracking-wider sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Selling Price</th>
                <th className="py-2.5 px-3 text-right">Stock</th>
                <th className="py-2.5 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.map(product => {
                const isLow = product.stock <= 15 && product.category !== 'printing';

                return (
                  <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-200">{product.name}</div>
                      <div className="text-[10px] text-slate-500">Unit: {product.unit}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="capitalize text-slate-400 font-medium">{product.category}</span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200">
                      {settings.currencySymbol}{product.price.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      <span className={isLow ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                        {product.stock}
                      </span>
                      {isLow && (
                        <div className="text-[9px] text-amber-500 font-sans">Low Stock</div>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 font-mono">
                        <button
                          onClick={() => updateProductStock(product.id, product.stock + 10)}
                          className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => updateProductStock(product.id, product.stock + 25)}
                          className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                        >
                          +25
                        </button>
                        <button
                          onClick={() => updateProductStock(product.id, product.stock + 50)}
                          className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                        >
                          +50
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>{products.length} catalog SKU items tracked</span>
          <button
            onClick={closeModal}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
