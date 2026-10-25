import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { PosProduct, PaymentMethod } from '../../types';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Package,
  Check,
  CreditCard,
  Banknote,
  QrCode,
  FileText,
  Scan,
  Cable,
  HardDrive,
  Coffee,
  Cookie,
  Car,
  X,
  PlusCircle,
  Receipt,
  Sparkles,
  Bot,
  Pencil,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { AfrinaChatBot } from '../chat/AfrinaChatBot';

interface CartItem {
  product: PosProduct;
  quantity: number;
}

export const PosCounter: React.FC = () => {
  const {
    products,
    rateChart,
    members,
    openModal,
    directPosCheckout,
    addProduct,
    updateProduct,
    deleteProduct,
    updateRateChartItem,
    deleteRateChartItem,
    khataCustomers,
    addKhataCustomer,
    addKhataEntry,
    settings
  } = useCyberCafe();

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'rate_chart' | 'printing' | 'accessory' | 'beverage' | 'snack'>('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [walkinName, setWalkinName] = useState<string>('Counter Customer');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customDiscountPct, setCustomDiscountPct] = useState<number>(0);
  const [activeViewMode, setActiveViewMode] = useState<'catalog' | 'chatbot'>('catalog');

  // New Stock / Custom Item Modal State
  const [isNewStockModalOpen, setIsNewStockModalOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemQty, setCustomItemQty] = useState('1');
  const [customItemUnit, setCustomItemUnit] = useState('piece');
  const [saveToInventory, setSaveToInventory] = useState(true);

  // Edit Item Modal State
  const [editingProduct, setEditingProduct] = useState<PosProduct | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editUnit, setEditUnit] = useState('piece');
  const [editCategory, setEditCategory] = useState<'beverage' | 'snack' | 'meal' | 'printing' | 'accessory'>('printing');

  // Delete Item Confirmation State
  const [deletingProduct, setDeletingProduct] = useState<PosProduct | null>(null);

  // Khata (বাকি) Integration in POS State
  const [selectedKhataCustomerId, setSelectedKhataCustomerId] = useState<string>('');
  const [isNewKhataCustInPos, setIsNewKhataCustInPos] = useState<boolean>(false);
  const [newKhataCustName, setNewKhataCustName] = useState<string>('');
  const [newKhataCustPhone, setNewKhataCustPhone] = useState<string>('');
  const [newKhataCustVillage, setNewKhataCustVillage] = useState<string>('');

  // 1. Auto-sync Rate Chart Services into POS items dynamically!
  const rateChartPosItems: PosProduct[] = rateChart.map(rc => ({
    id: `rc-item-${rc.id}`,
    name: rc.serviceNameBn ? `${rc.serviceName} (${rc.serviceNameBn})` : rc.serviceName,
    category: 'printing',
    price: rc.customerRate,
    cost: rc.govtFee || 0,
    stock: 9999, // Always available for instant billing
    unit: 'service',
    iconName: rc.category === 'driving_licence' ? 'Car' : (rc.category === 'pvc_cards' ? 'CreditCard' : 'FileText')
  }));

  // Combine store products + auto-synced rate chart services
  const allAvailableItems = [...products, ...rateChartPosItems];

  // Filter products based on search and category
  const filteredProducts = allAvailableItems.filter(p => {
    const isRateChartItem = p.id.startsWith('rc-item-');
    if (categoryFilter === 'rate_chart' && !isRateChartItem) return false;
    if (categoryFilter !== 'all' && categoryFilter !== 'rate_chart') {
      if (isRateChartItem) return false;
      if (p.category !== categoryFilter) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.price.toString().includes(q);
    }
    return true;
  });

  // Cart operations
  const addToCart = (product: PosProduct) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  // Handle Adding Custom New Stock Item directly to Bill
  const handleAddNewStockItem = (e: React.FormEvent) => {
    e.preventDefault();
    const name = customItemName.trim();
    const price = parseFloat(customItemPrice) || 0;
    const qty = parseInt(customItemQty, 10) || 1;

    if (!name || price <= 0 || qty <= 0) return;

    const newProductId = `custom-stock-${Date.now()}`;
    const newProduct: PosProduct = {
      id: newProductId,
      name,
      category: 'accessory',
      price,
      cost: Number((price * 0.7).toFixed(2)),
      stock: saveToInventory ? 100 : 9999,
      unit: customItemUnit,
      iconName: 'Package'
    };

    if (saveToInventory) {
      addProduct({
        name,
        category: 'accessory',
        price,
        cost: Number((price * 0.7).toFixed(2)),
        stock: 50,
        unit: customItemUnit,
        iconName: 'Package'
      });
    }

    // Add directly to cart
    setCart(prev => {
      const existing = prev.find(item => item.product.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        return prev.map(item => item.product.name.toLowerCase() === name.toLowerCase() ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { product: newProduct, quantity: qty }];
    });

    setToastMessage(`✓ Added "${name}" (${qty} ${customItemUnit} @ ₹${price}) to bill!`);
    setTimeout(() => setToastMessage(null), 3000);

    // Reset and close
    setCustomItemName('');
    setCustomItemPrice('');
    setCustomItemQty('1');
    setIsNewStockModalOpen(false);
  };

  const handleBotAddToCart = (items: { id: string; name: string; price: number; quantity: number }[]) => {
    items.forEach(item => {
      let existingProd = allAvailableItems.find(p => p.id === item.id || p.name.toLowerCase() === item.name.toLowerCase());
      if (!existingProd) {
        existingProd = {
          id: item.id || `bot-item-${Date.now()}`,
          name: item.name,
          price: item.price,
          cost: 0,
          stock: 9999,
          category: 'printing',
          unit: 'service',
          iconName: 'FileText'
        };
      }
      setCart(prev => {
        const found = prev.find(c => c.product.id === existingProd!.id);
        if (found) {
          return prev.map(c => c.product.id === existingProd!.id ? { ...c, quantity: c.quantity + item.quantity } : c);
        }
        return [...prev, { product: existingProd!, quantity: item.quantity }];
      });
    });
    setToastMessage(`✓ চ্যাটবট থেকে বিলে যোগ করা হয়েছে: ${items.map(i => i.name).join(', ')}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Edit Item Modal
  const handleOpenEditItem = (prod: PosProduct) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditPrice(prod.price.toString());
    setEditStock(prod.stock.toString());
    setEditUnit(prod.unit || 'piece');
    setEditCategory(prod.category as any || 'printing');
  };

  // Save Edited Item
  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const name = editName.trim();
    const price = parseFloat(editPrice) || 0;
    const stock = parseInt(editStock, 10) || 0;

    if (!name || price < 0) return;

    if (editingProduct.id.startsWith('rc-item-')) {
      const rcId = editingProduct.id.replace('rc-item-', '');
      updateRateChartItem(rcId, {
        serviceName: name,
        customerRate: price
      });
    } else {
      updateProduct(editingProduct.id, {
        name,
        price,
        stock,
        unit: editUnit,
        category: editCategory
      });
    }

    // Update cart item if present
    setCart(prev => prev.map(item => {
      if (item.product.id === editingProduct.id) {
        return {
          ...item,
          product: {
            ...item.product,
            name,
            price,
            stock,
            unit: editUnit,
            category: editCategory
          }
        };
      }
      return item;
    }));

    setToastMessage(`✓ আইটেম "${name}" সফলভাবে এডিট ও আপডেট করা হয়েছে!`);
    setTimeout(() => setToastMessage(null), 3000);
    setEditingProduct(null);
  };

  // Open Delete Item Confirmation
  const handleOpenDeleteItem = (prod: PosProduct) => {
    setDeletingProduct(prod);
  };

  // Confirm Delete Item
  const handleConfirmDelete = () => {
    if (!deletingProduct) return;

    if (deletingProduct.id.startsWith('rc-item-')) {
      const rcId = deletingProduct.id.replace('rc-item-', '');
      deleteRateChartItem(rcId);
    } else {
      deleteProduct(deletingProduct.id);
    }

    // Remove from cart if present
    setCart(prev => prev.filter(item => item.product.id !== deletingProduct.id));

    setToastMessage(`✓ আইটেম "${deletingProduct.name}" সফলভাবে ডিলিট করা হয়েছে!`);
    setTimeout(() => setToastMessage(null), 3000);
    setDeletingProduct(null);
  };

  // Financials
  const member = selectedMemberId ? members.find(m => m.id === selectedMemberId) : null;
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountPct = customDiscountPct > 0 ? customDiscountPct : (member ? member.discountPct : 0);
  const discountAmount = Number(((subtotal * discountPct) / 100).toFixed(2));
  const taxable = Math.max(0, subtotal - discountAmount);
  const tax = Number(((taxable * (settings.taxRatePct / 100))).toFixed(2));
  const grandTotal = Number((taxable + tax).toFixed(2));

  const parsedCash = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, parsedCash - grandTotal);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderPayload = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      name: item.product.name,
      price: item.product.price,
      category: item.product.category
    }));

    if (paymentMethod === 'khata') {
      let custId = selectedKhataCustomerId;
      let custName = walkinName;

      if (isNewKhataCustInPos) {
        if (!newKhataCustName.trim()) {
          setToastMessage('⚠️ অনুগ্রহ করে গ্রাহকের নাম লিখুন');
          setTimeout(() => setToastMessage(null), 3000);
          return;
        }
        const newCust = addKhataCustomer({
          name: newKhataCustName.trim(),
          phone: newKhataCustPhone.trim() || '8609550430',
          village: newKhataCustVillage.trim() || 'Bali Hatpara, Nowda',
          notes: 'Created via Xerox POS Counter'
        });
        custId = newCust.id;
        custName = newCust.name;
      } else {
        const found = khataCustomers.find(c => c.id === custId);
        if (found) {
          custName = found.name;
        }
      }

      if (!custId) {
        setToastMessage('⚠️ অনুগ্রহ করে একজন বাকি খাতা গ্রাহক নির্বাচন করুন');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      // Record in Khata
      addKhataEntry({
        customerId: custId,
        type: 'baki',
        amount: grandTotal,
        totalBill: grandTotal,
        paidAmount: 0,
        dueAmount: grandTotal,
        serviceName: `POS / Xerox (${cart.map(i => `${i.product.name} x${i.quantity}`).slice(0, 2).join(', ')}${cart.length > 2 ? '...' : ''})`,
        notes: `Billed from Xerox POS counter at ${new Date().toLocaleTimeString()}`
      });

      // Direct POS checkout as due
      directPosCheckout(
        orderPayload,
        'due',
        custName,
        undefined,
        discountPct
      );

      setToastMessage(`✓ ${custName}-এর ডিজিটাল খাতায় ₹${grandTotal.toFixed(2)} বাকি যোগ করা হয়েছে!`);
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      directPosCheckout(
        orderPayload,
        paymentMethod,
        member ? member.name : (walkinName.trim() || 'Counter Customer'),
        member ? member.id : undefined,
        discountPct
      );
    }

    clearCart();
    setCashTendered('');
    openModal('receipt');
  };

  const getProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard': return <CreditCard className="w-5 h-5 text-cyan-400" />;
      case 'FileText': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'Car': return <Car className="w-5 h-5 text-amber-400" />;
      case 'Printer': return <Printer className="w-5 h-5 text-cyan-400" />;
      case 'Scan': return <Scan className="w-5 h-5 text-emerald-400" />;
      case 'Coffee': return <Coffee className="w-5 h-5 text-amber-300" />;
      case 'Cookie': return <Cookie className="w-5 h-5 text-yellow-400" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5 text-purple-400" />;
      case 'Cable': return <Cable className="w-5 h-5 text-cyan-300" />;
      default: return <Package className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs rounded-xl flex items-center justify-between shadow-lg animate-in fade-in">
          <span className="font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main 2-Column Split: Catalog on Left, Billing Counter on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Product & Rate Chart Catalog (lg:col-span-7 xl:col-span-8) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Header & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                <span>Xerox, Rate Chart & POS Counter / পস বিলিং</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {settings.cafeName} · Auto-synced with Rate Chart & Inventory
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* AI Chatbot Toggle Button */}
              <button
                type="button"
                onClick={() => setActiveViewMode(activeViewMode === 'chatbot' ? 'catalog' : 'chatbot')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer ${
                  activeViewMode === 'chatbot'
                    ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-cyan-400/20'
                    : 'bg-purple-950/80 hover:bg-purple-900/90 text-purple-300 border border-purple-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>{activeViewMode === 'chatbot' ? '📦 Show Catalog (ক্যাটালগ)' : '🤖 AI Seva & Xerox Bot (চ্যাট বট)'}</span>
              </button>

              {/* Add New Stock / Custom Item Button */}
              <button
                onClick={() => setIsNewStockModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl transition-all shadow-md shadow-amber-400/20 cursor-pointer active:scale-98"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>+ New Stock (নতুন স্টক লিখে বিল)</span>
              </button>

              <button
                onClick={() => openModal('inventory')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-colors cursor-pointer"
              >
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                <span>Manage Stock</span>
              </button>
            </div>
          </div>

          {/* Conditional: Either AI Chatbot or Product Catalog */}
          {activeViewMode === 'chatbot' ? (
            <AfrinaChatBot
              isEmbedded={true}
              onAddToCart={handleBotAddToCart}
            />
          ) : (
            <>
              {/* Category Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                
                {/* Category Segmented Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {[
                    { id: 'all', label: 'All Items (সব)' },
                    { id: 'rate_chart', label: '📜 Rate Chart Services' },
                    { id: 'printing', label: '🖨️ Xerox & Prints' },
                    { id: 'accessory', label: '🔌 Accessories & Gear' },
                    { id: 'beverage', label: '☕ Tea & Snacks' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id as any)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                        categoryFilter === cat.id
                          ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-xs'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative min-w-[180px]">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search item or rate..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:border-cyan-500"
                  />
                </div>

              </div>

          {/* Product & Service Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredProducts.map(product => {
              const isRateChartItem = product.id.startsWith('rc-item-');
              const isLowStock = !isRateChartItem && product.stock <= 15;

              return (
                <div
                  key={product.id}
                  className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${
                    isRateChartItem
                      ? 'border-cyan-900/60 bg-gradient-to-br from-slate-900 to-cyan-950/30 hover:border-cyan-700/80 shadow-xs'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center">
                        {getProductIcon(product.iconName)}
                      </div>
                      <div className="flex items-center gap-1">
                        {isRateChartItem ? (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                            Rate Chart
                          </span>
                        ) : (
                          <span className={`text-[10px] font-mono ${isLowStock ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                            {product.stock} {product.unit}
                          </span>
                        )}

                        {/* Edit Item Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditItem(product);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                          title="Edit Item / স্টক এডিট করুন"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Item Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteItem(product);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Item / ডিলিট করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-semibold text-xs text-slate-100 line-clamp-2 leading-tight">
                      {product.name}
                    </h4>

                    <div className="flex items-baseline gap-1 text-[11px] text-slate-400 mt-2">
                      <span className="font-mono tabular-nums text-emerald-400 font-bold text-sm">
                        {settings.currencySymbol}{product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="mt-3 w-full py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors bg-slate-800 hover:bg-cyan-400 hover:text-slate-950 text-slate-200 border border-slate-700/60 cursor-pointer active:scale-98 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add to Bill</span>
                  </button>
                </div>
              );
            })}
          </div>
            </>
          )}

        </div>

        {/* Right Column: Active Bill & Thermal POS Register (lg:col-span-5 xl:col-span-4) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl p-4 sm:p-5 space-y-4">
            
            {/* Register Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-cyan-400" />
                  <span>Customer Bill / ক্যাশ মেমো</span>
                </h3>
                <span className="text-[11px] text-slate-400">{cart.length} items in cart</span>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Customer Name / নাম</label>
              <input
                type="text"
                value={walkinName}
                onChange={(e) => setWalkinName(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-cyan-500"
              />
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 divide-y divide-slate-800/80">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  Cart is empty. Click "+ Add to Bill" or "+ New Stock" on the left to start billing.
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <div className="font-medium text-slate-200 line-clamp-1">{item.product.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {settings.currencySymbol}{item.product.price} × {item.quantity} = {settings.currencySymbol}{(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-bold text-white w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-6 h-6 rounded text-slate-500 hover:text-rose-400 flex items-center justify-center cursor-pointer ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discount Chips: 0%, 5%, 10%, 15%, 20% */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Special Discount (ছাড় %):</span>
                <span className="font-mono text-amber-300 font-semibold">{discountPct}%</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[0, 5, 10, 15, 20].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setCustomDiscountPct(pct)}
                    className={`py-1 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                      customDiscountPct === pct
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Summary Strip */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal (মোট)</span>
                <span className="font-mono">{settings.currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Discount ({discountPct}%)</span>
                  <span className="font-mono">-{settings.currencySymbol}{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-white pt-1 border-t border-slate-800">
                <span>Total Payable (নিট বিল)</span>
                <span className="font-mono text-emerald-400 text-base">{settings.currencySymbol}{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="block text-slate-400 text-[11px]">Payment Mode / পেমেন্টের মাধ্যম</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Cash (ক্যাশ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr_pay')}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    paymentMethod === 'qr_pay'
                      ? 'bg-cyan-400 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('khata')}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    paymentMethod === 'khata'
                      ? 'bg-rose-500 text-white font-bold shadow-xs'
                      : 'bg-slate-950 border border-slate-800 text-rose-400 hover:text-rose-300'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>বাকি (Khata)</span>
                </button>
              </div>

              {/* Khata Customer Selection Block */}
              {paymentMethod === 'khata' && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                      <span>Select Khata Customer (বাকি খাতা গ্রাহক) *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsNewKhataCustInPos(!isNewKhataCustInPos)}
                      className="text-[10px] text-cyan-400 hover:underline font-semibold"
                    >
                      {isNewKhataCustInPos ? '← Choose Existing' : '+ New Customer'}
                    </button>
                  </div>

                  {!isNewKhataCustInPos ? (
                    <select
                      value={selectedKhataCustomerId}
                      onChange={(e) => setSelectedKhataCustomerId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:border-rose-500 outline-none"
                    >
                      <option value="">-- Choose Customer ({khataCustomers.length} registered) --</option>
                      {khataCustomers.map(cust => (
                        <option key={cust.id} value={cust.id}>
                          {cust.name} ({cust.phone || cust.village}) · বাকি: ₹{cust.totalDue}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Customer Name (গ্রাহকের নাম) *"
                        value={newKhataCustName}
                        onChange={(e) => setNewKhataCustName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-rose-500 outline-none"
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="tel"
                          placeholder="Mobile (মোবাইল)"
                          value={newKhataCustPhone}
                          onChange={(e) => setNewKhataCustPhone(e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-rose-500 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Village / Para (গ্রাম/পাড়া)"
                          value={newKhataCustVillage}
                          onChange={(e) => setNewKhataCustVillage(e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-rose-500 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-rose-300/80">
                    ⚡ এই বিলের সম্পূর্ণ <strong>₹{grandTotal.toFixed(2)}</strong> টাকা সরাসরি গ্রাহকের বাকি খাতায় যুক্ত হবে।
                  </p>
                </div>
              )}
            </div>

            {/* Cash Tendered & Change */}
            {paymentMethod === 'cash' && (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-slate-500 text-[10px] mb-0.5">Cash Received (ক্যাশ জমা)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 500"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-lg px-2.5 py-1.5 focus:border-cyan-500"
                  />
                </div>
                {parsedCash > 0 && (
                  <div className="flex-1 text-right">
                    <label className="block text-slate-500 text-[10px] mb-0.5">Change Return (ফেরত)</label>
                    <div className="font-mono font-bold text-amber-400 text-sm">
                      {settings.currencySymbol}{changeDue.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Checkout & Bill Generation Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98 ${
                cart.length === 0
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-cyan-400/20'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Complete Bill & Print Receipt (বিল প্রিন্ট)</span>
            </button>

          </div>
        </div>

      </div>

      {/* NEW STOCK / CUSTOM ITEM MODAL */}
      {isNewStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Add New Stock / Custom Item (নতুন স্টক লিখে বিল)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Type any new product or service name to add directly to current bill
                </p>
              </div>
              <button
                onClick={() => setIsNewStockModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewStockItem} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Stock / Service Name (আইটেম বা কাজের নাম) *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Passport Photo 8 copy, A4 Paper Packet, Spiral Binding..."
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs focus:border-amber-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Unit Price (দর / দাম ₹) *
                  </label>
                  <div className="relative">
                    <span className="text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 font-mono">
                      {settings.currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="1"
                      required
                      placeholder="100"
                      value={customItemPrice}
                      onChange={(e) => setCustomItemPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm font-bold rounded-xl pl-7 pr-3 py-2 focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Quantity (পরিমাণ) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm font-bold rounded-xl px-3 py-2 focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Unit of Measurement (পরিমাপ একক)</label>
                <select
                  value={customItemUnit}
                  onChange={(e) => setCustomItemUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:border-amber-400"
                >
                  <option value="piece">Piece (পিস)</option>
                  <option value="copy">Copy (কপি)</option>
                  <option value="page">Page (পাতা)</option>
                  <option value="packet">Packet (প্যাকেট)</option>
                  <option value="rim">Rim (রিম)</option>
                  <option value="card">Card (কার্ড)</option>
                  <option value="service">Service (সেবা)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  type="checkbox"
                  id="saveInv"
                  checked={saveToInventory}
                  onChange={(e) => setSaveToInventory(e.target.checked)}
                  className="rounded border-slate-700 text-amber-400 focus:ring-0"
                />
                <label htmlFor="saveInv" className="text-slate-300 text-xs cursor-pointer">
                  Save to permanent inventory (ভবিষ্যতে ব্যবহারের জন্য ক্যাফে স্টকে সেভ রাখুন)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewStockModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-400/20 cursor-pointer"
                >
                  + Add to Bill (বিলে যোগ করুন)
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* EDIT ITEM MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-cyan-800/80 bg-slate-900 shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">
                  Edit Item / স্টক ও রেট পরিবর্তন
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Item Name / পণ্যের নাম *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rate / Price (বিক্রয় মূল্য ₹) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold text-sm rounded-xl px-3 py-2 focus:border-cyan-400 outline-none"
                  />
                </div>

                {!editingProduct.id.startsWith('rc-item-') && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Stock (মজুদ সংখ্যা) *</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono font-bold text-sm rounded-xl px-3 py-2 focus:border-cyan-400 outline-none"
                    />
                  </div>
                )}
              </div>

              {!editingProduct.id.startsWith('rc-item-') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Unit (একক)</label>
                    <select
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-2 focus:border-cyan-400 outline-none"
                    >
                      <option value="piece">Piece (পিস)</option>
                      <option value="copy">Copy (কপি)</option>
                      <option value="page">Page (পাতা)</option>
                      <option value="packet">Packet (প্যাকেট)</option>
                      <option value="rim">Rim (রিম)</option>
                      <option value="card">Card (কার্ড)</option>
                      <option value="pouch">Pouch (পাউচ)</option>
                      <option value="envelope">Envelope (খাম)</option>
                      <option value="service">Service (সেবা)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Category (বিভাগ)</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-2 focus:border-cyan-400 outline-none"
                    >
                      <option value="printing">Xerox & Printing</option>
                      <option value="accessory">Accessories & Gear</option>
                      <option value="snack">Snacks</option>
                      <option value="beverage">Beverage</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all cursor-pointer shadow-sm"
                >
                  Save Changes (সেভ করুন)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ITEM CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-rose-800/80 bg-slate-900 shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Delete Item / স্টক থেকে ডিলিট?
                </h3>
                <p className="text-[11px] text-slate-400">এই আইটেমটি ক্যাটালগ থেকে মুছে ফেলা হবে</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-slate-200">{deletingProduct.name}</div>
              <div className="text-slate-400 flex items-center justify-between text-[11px]">
                <span>Rate: <strong className="text-emerald-400">₹{deletingProduct.price}</strong></span>
                {!deletingProduct.id.startsWith('rc-item-') && (
                  <span>Stock: {deletingProduct.stock} {deletingProduct.unit}</span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-rose-300">
              ⚠️ আপনি কি নিশ্চিত? ডিলিট করলে এটি আপনার বিলিং কাউন্টার ও স্টক থেকে মুছে যাবে।
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel (বাতিল)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer shadow-md shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete (ডিলিট করুন)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
