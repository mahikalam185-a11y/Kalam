import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActiveSession,
  CafeSettings,
  KhataCustomer,
  KhataTransaction,
  Member,
  PaymentMethod,
  PosProduct,
  RateChartItem,
  ServiceOrder,
  ServiceOrderStatus,
  SessionOrderItem,
  SessionType,
  ShiftSummary,
  Station,
  StationStatus,
  TransactionReceipt
} from '../types';
import {
  INITIAL_KHATA_CUSTOMERS,
  INITIAL_KHATA_TRANSACTIONS,
  INITIAL_MEMBERS,
  INITIAL_PRODUCTS,
  INITIAL_RATE_CHART,
  INITIAL_SERVICE_ORDERS,
  INITIAL_SETTINGS,
  INITIAL_SHIFT,
  INITIAL_STATIONS,
  INITIAL_TRANSACTIONS
} from '../data/initialData';

export type AppTab = 'orders' | 'portal' | 'ratechart' | 'khata' | 'terminals' | 'pos' | 'ledger' | 'settings' | 'login';

export type ModalType =
  | 'newOrder'
  | 'editOrder'
  | 'orderDetails'
  | 'editRate'
  | 'addRate'
  | 'newKhataCustomer'
  | 'editKhataCustomer'
  | 'khataEntry'
  | 'editKhataEntry'
  | 'startSession'
  | 'checkout'
  | 'receipt'
  | 'inventory'
  | 'details'
  | 'transfer'
  | 'quickPrint'
  | 'member'
  | 'topup';

export interface LiveSessionBill {
  durationMinutes: number;
  timeCharge: number;
  ordersCharge: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  isOverdue: boolean;
  remainingMinutes?: number;
  elapsedSeconds: number;
}

interface CyberCafeContextType {
  // Navigation & Core
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currentTime: number;
  settings: CafeSettings;
  updateSettings: (updates: Partial<CafeSettings>) => void;
  resetToDemoData: () => void;

  // Admin Privacy Lock & Auth
  isAdminAuthenticated: boolean;
  adminPin: string;
  loginAdmin: (usernameOrPin: string, password?: string) => boolean;
  logoutAdmin: () => void;

  // 1. Service Orders (Add, Edit, Delete, Update Payment, Save)
  serviceOrders: ServiceOrder[];
  addServiceOrder: (order: Omit<ServiceOrder, 'id' | 'tokenNumber' | 'createdAt'>) => ServiceOrder;
  updateServiceOrder: (orderId: string, updates: Partial<ServiceOrder>) => void;
  updateServiceOrderStatus: (orderId: string, status: ServiceOrderStatus, ackNumber?: string) => void;
  updateServiceOrderPayment: (orderId: string, additionalPayment: number, paymentMethod: PaymentMethod) => void;
  deleteServiceOrder: (orderId: string) => void;
  selectedOrder: ServiceOrder | null;
  setSelectedOrder: (order: ServiceOrder | null) => void;

  // 2. Rate Chart (Add, Edit, Delete)
  rateChart: RateChartItem[];
  addRateChartItem: (item: Omit<RateChartItem, 'id'>) => void;
  updateRateChartItem: (id: string, updates: Partial<RateChartItem>) => void;
  deleteRateChartItem: (id: string) => void;

  // 3. Khata Book (Add, Edit, Delete Customer, Add/Edit/Delete Entry)
  khataCustomers: KhataCustomer[];
  khataTransactions: KhataTransaction[];
  addKhataCustomer: (customer: Omit<KhataCustomer, 'id' | 'totalDue' | 'totalPaid' | 'createdAt'>) => KhataCustomer;
  updateKhataCustomer: (customerId: string, updates: Partial<KhataCustomer>) => void;
  deleteKhataCustomer: (customerId: string) => void;
  addKhataEntry: (params: {
    customerId: string;
    type: 'baki' | 'joma';
    amount: number;
    totalBill?: number;
    paidAmount?: number;
    dueAmount?: number;
    serviceName: string;
    notes?: string;
  }) => void;
  editKhataEntry: (transactionId: string, updates: {
    serviceName: string;
    totalBill?: number;
    paidAmount?: number;
    dueAmount?: number;
    notes?: string;
    type?: 'baki' | 'joma';
    amount?: number;
  }) => void;
  deleteKhataEntry: (transactionId: string) => void;
  selectedKhataCustomerId: string | null;
  setSelectedKhataCustomerId: (id: string | null) => void;
  selectedKhataTransaction: KhataTransaction | null;
  setSelectedKhataTransaction: (tx: KhataTransaction | null) => void;

  // 4. Terminals & Browsing Cabins
  stations: Station[];
  selectedStationId: string | null;
  setSelectedStationId: (id: string | null) => void;
  startSession: (stationId: string, params: {
    customerName: string;
    customerPhone?: string;
    memberId?: string;
    type: SessionType;
    allocatedMinutes?: number;
    notes?: string;
  }) => void;
  pauseSession: (stationId: string) => void;
  resumeSession: (stationId: string) => void;
  extendSession: (stationId: string, addedMinutes: number) => void;
  transferStation: (fromStationId: string, toStationId: string) => boolean;
  setStationStatus: (stationId: string, status: StationStatus) => void;
  addOrderToStation: (stationId: string, items: { productId: string; quantity: number }[]) => void;
  checkoutStation: (stationId: string, paymentMethod: PaymentMethod, notes?: string, customDiscountPct?: number) => TransactionReceipt | null;
  calculateLiveBill: (station: Station, asOfTime?: number) => LiveSessionBill;

  // 5. Retail POS & Quick Print
  products: PosProduct[];
  updateProductStock: (productId: string, newStock: number) => void;
  addProduct: (product: Omit<PosProduct, 'id'>) => void;
  updateProduct: (productId: string, updates: Partial<PosProduct>) => void;
  deleteProduct: (productId: string) => void;
  directPosCheckout: (items: { productId: string; quantity: number; name?: string; price?: number; category?: any }[], paymentMethod: PaymentMethod, customerName?: string, memberId?: string, customDiscountPct?: number) => TransactionReceipt;
  recordQuickPrintJob: (params: {
    monochromePages: number;
    colorPages: number;
    scanPages: number;
    targetStationId?: string;
    customerName?: string;
    paymentMethod?: PaymentMethod;
  }) => void;

  // 6. Members
  members: Member[];
  addMember: (memberData: Omit<Member, 'id' | 'memberCode' | 'totalSpent' | 'hoursLogged' | 'joinedDate'>) => Member;
  topupMemberBalance: (memberId: string, amount: number, paymentMethod: PaymentMethod) => void;

  // 7. Transactions & Shift
  transactions: TransactionReceipt[];
  activeReceipt: TransactionReceipt | null;
  setActiveReceipt: (receipt: TransactionReceipt | null) => void;
  currentShift: ShiftSummary;
  closeShift: (actualCash: number, notes?: string) => void;
  startNewShift: (operatorName: string, startingCash: number) => void;

  // Modals manager
  activeModal: ModalType | null;
  openModal: (modal: ModalType, extraId?: string) => void;
  closeModal: () => void;
}

const STORAGE_KEYS = {
  ORDERS: 'netseva_orders_v2',
  RATE_CHART: 'netseva_ratechart_v2',
  KHATA_CUSTOMERS: 'netseva_khata_cust_v2',
  KHATA_TX: 'netseva_khata_tx_v2',
  STATIONS: 'netseva_stations_v2',
  PRODUCTS: 'netseva_products_v2',
  MEMBERS: 'netseva_members_v2',
  TRANSACTIONS: 'netseva_transactions_v2',
  SETTINGS: 'netseva_settings_v2',
  SHIFT: 'netseva_shift_v2',
};

const CyberCafeContext = createContext<CyberCafeContextType | undefined>(undefined);

export const CyberCafeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [activeTab, setActiveTab] = useState<AppTab>('portal');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [selectedKhataCustomerId, setSelectedKhataCustomerId] = useState<string | null>(null);
  const [selectedKhataTransaction, setSelectedKhataTransaction] = useState<KhataTransaction | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<TransactionReceipt | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);

  // Admin Authentication & Privacy Lock (Default PIN: 8609)
  // Public visitors default to false so Citizen Portal is published safely
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('netseva_admin_auth');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const adminPin = '8609';

  const loginAdmin = (usernameOrPin: string, password?: string): boolean => {
    // If only one param is provided (PIN or quick login)
    if (!password) {
      const pin = usernameOrPin.trim();
      if (pin === adminPin || pin === '8609') {
        setIsAdminAuthenticated(true);
        try {
          localStorage.setItem('netseva_admin_auth', 'true');
        } catch {
          // ignore
        }
        return true;
      }
      return false;
    }

    // Both Username & Password provided
    const u = usernameOrPin.trim().toLowerCase();
    const p = password.trim();

    const validUsers = [
      'abukalam',
      'abu kalam',
      'abu kalam sheikh',
      '8609550430',
      'admin',
      'mahikalam185@gmail.com'
    ];
    const validPasswords = ['8609', 'afrina8609', adminPin];

    const isUserValid = validUsers.includes(u) || u === settings.phone.toLowerCase() || u === settings.operatorName.toLowerCase();
    const isPassValid = validPasswords.includes(p) || p === adminPin;

    if (isUserValid && isPassValid) {
      setIsAdminAuthenticated(true);
      try {
        localStorage.setItem('netseva_admin_auth', 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.setItem('netseva_admin_auth', 'false');
    } catch {
      // ignore
    }
  };

  // 1. Service Orders State
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_SERVICE_ORDERS;
    } catch {
      return INITIAL_SERVICE_ORDERS;
    }
  });

  // 2. Rate Chart State (with automatic Learner Licence LL check)
  const [rateChart, setRateChart] = useState<RateChartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RATE_CHART);
      if (saved) {
        const parsed: RateChartItem[] = JSON.parse(saved);
        // Ensure driving licence and Learner Licence (LL) items exist
        const hasLL = parsed.some(r => r.serviceName.includes('Learner Licence') || r.id === 'rc-ll-1');
        if (!hasLL) {
          const llItems = INITIAL_RATE_CHART.filter(r => r.category === 'driving_licence');
          const nonDl = parsed.filter(r => r.category !== 'driving_licence');
          return [...llItems, ...nonDl];
        }
        return parsed;
      }
      return INITIAL_RATE_CHART;
    } catch {
      return INITIAL_RATE_CHART;
    }
  });

  // 3. Khata Customers & Transactions
  const [khataCustomers, setKhataCustomers] = useState<KhataCustomer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.KHATA_CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_KHATA_CUSTOMERS;
    } catch {
      return INITIAL_KHATA_CUSTOMERS;
    }
  });

  const [khataTransactions, setKhataTransactions] = useState<KhataTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.KHATA_TX);
      return saved ? JSON.parse(saved) : INITIAL_KHATA_TRANSACTIONS;
    } catch {
      return INITIAL_KHATA_TRANSACTIONS;
    }
  });

  // 4. Stations & POS Products
  const [stations, setStations] = useState<Station[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATIONS);
      return saved ? JSON.parse(saved) : INITIAL_STATIONS;
    } catch {
      return INITIAL_STATIONS;
    }
  });

  const [products, setProducts] = useState<PosProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [transactions, setTransactions] = useState<TransactionReceipt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [settings, setSettings] = useState<CafeSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed: CafeSettings = JSON.parse(saved);
        parsed.cafeName = 'AFRINA INTERNET CAFE';
        parsed.phone = '8609550430';
        parsed.address = 'BALI HATPARA NOWDA MSD 741156';
        parsed.operatorName = 'ABU KALAM SHEIKH';
        parsed.upiQrId = '8609550430@ybl';
        return parsed;
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [currentShift, setCurrentShift] = useState<ShiftSummary>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHIFT);
      return saved ? JSON.parse(saved) : INITIAL_SHIFT;
    } catch {
      return INITIAL_SHIFT;
    }
  });

  // Persistence effects
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(serviceOrders)); }, [serviceOrders]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RATE_CHART, JSON.stringify(rateChart)); }, [rateChart]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.KHATA_CUSTOMERS, JSON.stringify(khataCustomers)); }, [khataCustomers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.KHATA_TX, JSON.stringify(khataTransactions)); }, [khataTransactions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STATIONS, JSON.stringify(stations)); }, [stations]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SHIFT, JSON.stringify(currentShift)); }, [currentShift]);

  // Clock tick every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openModal = (modal: ModalType, extraId?: string) => {
    if (extraId) {
      if (modal === 'startSession' || modal === 'checkout' || modal === 'details' || modal === 'transfer') {
        setSelectedStationId(extraId);
      }
      if (modal === 'khataEntry' || modal === 'editKhataCustomer') {
        setSelectedKhataCustomerId(extraId);
      }
    }
    setActiveModal(modal);
  };

  const closeModal = () => setActiveModal(null);

  // 1. Service Orders Actions
  const addServiceOrder = (orderData: Omit<ServiceOrder, 'id' | 'tokenNumber' | 'createdAt'>): ServiceOrder => {
    const tokenNumber = `SEVA-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: ServiceOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      tokenNumber,
      createdAt: Date.now()
    };

    setServiceOrders(prev => [newOrder, ...prev]);

    // If advance paid > 0, record in transactions & shift cash
    if (orderData.advancePaid > 0) {
      const receipt: TransactionReceipt = {
        id: `tx-ord-${Date.now()}`,
        receiptNumber: `REC-${tokenNumber}`,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        isMember: false,
        endTime: Date.now(),
        durationMinutes: 0,
        timeCharge: 0,
        ordersCharge: orderData.advancePaid,
        orders: [
          {
            id: `ord-item-${Date.now()}`,
            itemId: 'service',
            name: `${orderData.serviceName} (${orderData.dueAmount > 0 ? 'Advance Paid' : 'Full Payment'})`,
            category: 'printing',
            price: orderData.advancePaid,
            quantity: 1,
            orderedAt: Date.now()
          }
        ],
        subtotal: orderData.advancePaid,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: orderData.advancePaid,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        operatorName: settings.operatorName,
        timestamp: Date.now(),
        serviceOrderId: newOrder.id
      };

      setTransactions(prev => [receipt, ...prev]);
      setCurrentShift(prev => ({
        ...prev,
        cashRevenue: Number((prev.cashRevenue + orderData.advancePaid).toFixed(2)),
        totalRevenue: Number((prev.totalRevenue + orderData.advancePaid).toFixed(2)),
        serviceOrdersCompleted: prev.serviceOrdersCompleted + 1
      }));
    }

    // If there is due amount, also automatically add/update Khata entry for the customer
    if (orderData.dueAmount > 0 || orderData.advancePaid > 0) {
      let existingCustomer = khataCustomers.find(k => k.phone === orderData.customerPhone || k.name.toLowerCase() === orderData.customerName.toLowerCase());
      if (!existingCustomer) {
        existingCustomer = addKhataCustomer({
          name: orderData.customerName,
          phone: orderData.customerPhone,
          village: orderData.customerVillage || 'Local Area',
          notes: `Added from order ${tokenNumber}`
        });
      }
      
      addKhataEntry({
        customerId: existingCustomer.id,
        type: orderData.dueAmount > 0 ? 'baki' : 'joma',
        amount: orderData.dueAmount > 0 ? orderData.dueAmount : orderData.advancePaid,
        totalBill: orderData.totalFee,
        paidAmount: orderData.advancePaid,
        dueAmount: orderData.dueAmount,
        serviceName: `${orderData.serviceName} (${tokenNumber})`,
        notes: `Total fee ₹${orderData.totalFee}, Advance paid ₹${orderData.advancePaid}, Due ₹${orderData.dueAmount}`
      });
    }

    return newOrder;
  };

  const updateServiceOrder = (orderId: string, updates: Partial<ServiceOrder>) => {
    setServiceOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, ...updates };
        if (updates.totalFee !== undefined || updates.advancePaid !== undefined) {
          const total = updates.totalFee !== undefined ? updates.totalFee : o.totalFee;
          const advance = updates.advancePaid !== undefined ? updates.advancePaid : o.advancePaid;
          updated.dueAmount = Math.max(0, total - advance);
          updated.paymentStatus = updated.dueAmount === 0 ? 'paid' : (advance > 0 ? 'partial' : 'due');
        }
        return updated;
      }
      return o;
    }));
  };

  const updateServiceOrderStatus = (orderId: string, status: ServiceOrderStatus, ackNumber?: string) => {
    setServiceOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          ackNumber: ackNumber !== undefined ? ackNumber : o.ackNumber,
          deliveredAt: status === 'delivered' ? Date.now() : o.deliveredAt
        };
      }
      return o;
    }));
  };

  const updateServiceOrderPayment = (orderId: string, additionalPayment: number, paymentMethod: PaymentMethod) => {
    setServiceOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newAdvance = o.advancePaid + additionalPayment;
        const newDue = Math.max(0, o.totalFee - newAdvance);
        const paymentStatus = newDue === 0 ? 'paid' : (newAdvance > 0 ? 'partial' : 'due');

        const receipt: TransactionReceipt = {
          id: `tx-ord-${Date.now()}`,
          receiptNumber: `REC-${o.tokenNumber}-SETTLE`,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          isMember: false,
          endTime: Date.now(),
          durationMinutes: 0,
          timeCharge: 0,
          ordersCharge: additionalPayment,
          orders: [
            {
              id: `ord-pay-${Date.now()}`,
              itemId: 'service',
              name: `${o.serviceName} - Due Settlement Payment`,
              category: 'printing',
              price: additionalPayment,
              quantity: 1,
              orderedAt: Date.now()
            }
          ],
          subtotal: additionalPayment,
          discountAmount: 0,
          taxAmount: 0,
          totalAmount: additionalPayment,
          paymentMethod,
          paymentStatus: 'paid',
          operatorName: settings.operatorName,
          timestamp: Date.now(),
          serviceOrderId: o.id
        };

        setTransactions(tprev => [receipt, ...tprev]);
        setActiveReceipt(receipt);

        const khataCust = khataCustomers.find(k => k.phone === o.customerPhone || k.name.toLowerCase() === o.customerName.toLowerCase());
        if (khataCust) {
          addKhataEntry({
            customerId: khataCust.id,
            type: 'joma',
            amount: additionalPayment,
            totalBill: o.totalFee,
            paidAmount: additionalPayment,
            dueAmount: newDue,
            serviceName: `Due Cleared for ${o.serviceName} (${o.tokenNumber})`,
            notes: `Paid ₹${additionalPayment} via ${paymentMethod}. Remaining due: ₹${newDue}`
          });
        }

        return {
          ...o,
          advancePaid: newAdvance,
          dueAmount: newDue,
          paymentStatus
        };
      }
      return o;
    }));
  };

  const deleteServiceOrder = (orderId: string) => {
    setServiceOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // 2. Rate Chart Actions
  const addRateChartItem = (item: Omit<RateChartItem, 'id'>) => {
    setRateChart(prev => [{ ...item, id: `rc-${Date.now()}` }, ...prev]);
  };

  const updateRateChartItem = (id: string, updates: Partial<RateChartItem>) => {
    setRateChart(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteRateChartItem = (id: string) => {
    setRateChart(prev => prev.filter(item => item.id !== id));
  };

  // 3. Khata Book Actions & Precision Mathematical Ledger
  const computeCustomerLedgerBalance = (customerId: string, txList: KhataTransaction[]) => {
    const custTx = txList.filter(t => t.customerId === customerId);
    let due = 0;
    let paid = 0;

    for (const t of custTx) {
      if (t.dueAmount !== undefined || t.paidAmount !== undefined) {
        due += (t.dueAmount || 0);
        paid += (t.paidAmount || 0);
      } else {
        if (t.type === 'baki') {
          due += t.amount;
        } else {
          due = Math.max(0, due - t.amount);
          paid += t.amount;
        }
      }
    }

    return {
      totalDue: Math.max(0, Number(due.toFixed(2))),
      totalPaid: Math.max(0, Number(paid.toFixed(2)))
    };
  };

  const addKhataCustomer = (customer: Omit<KhataCustomer, 'id' | 'totalDue' | 'totalPaid' | 'createdAt'>): KhataCustomer => {
    const newCust: KhataCustomer = {
      ...customer,
      id: `k-${Date.now()}`,
      totalDue: 0,
      totalPaid: 0,
      createdAt: Date.now()
    };
    setKhataCustomers(prev => [newCust, ...prev]);
    return newCust;
  };

  const updateKhataCustomer = (customerId: string, updates: Partial<KhataCustomer>) => {
    setKhataCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...updates } : c));
  };

  const deleteKhataCustomer = (customerId: string) => {
    setKhataCustomers(prev => prev.filter(c => c.id !== customerId));
    setKhataTransactions(prev => prev.filter(t => t.customerId !== customerId));
    setSelectedKhataCustomerId(prev => (prev === customerId ? null : prev));
  };

  const addKhataEntry = ({
    customerId,
    type,
    amount,
    totalBill,
    paidAmount,
    dueAmount,
    serviceName,
    notes
  }: {
    customerId: string;
    type: 'baki' | 'joma';
    amount: number;
    totalBill?: number;
    paidAmount?: number;
    dueAmount?: number;
    serviceName: string;
    notes?: string;
  }) => {
    const customer = khataCustomers.find(k => k.id === customerId);
    if (!customer) return;

    const effectiveTotalBill = totalBill !== undefined ? totalBill : (type === 'baki' ? amount : 0);
    const effectivePaid = paidAmount !== undefined ? paidAmount : (type === 'joma' ? amount : 0);
    const effectiveDue = dueAmount !== undefined ? dueAmount : (type === 'baki' ? amount : 0);

    const tx: KhataTransaction = {
      id: `kt-${Date.now()}`,
      customerId,
      customerName: customer.name,
      type,
      amount: type === 'baki' ? (effectiveDue > 0 ? effectiveDue : amount) : (effectivePaid > 0 ? effectivePaid : amount),
      totalBill: effectiveTotalBill,
      paidAmount: effectivePaid,
      dueAmount: effectiveDue,
      serviceName,
      notes,
      timestamp: Date.now()
    };

    setKhataTransactions(prev => {
      const nextTxList = [tx, ...prev];
      const { totalDue, totalPaid } = computeCustomerLedgerBalance(customerId, nextTxList);
      setKhataCustomers(cprev => cprev.map(k => k.id === customerId ? { ...k, totalDue, totalPaid } : k));
      return nextTxList;
    });
  };

  const editKhataEntry = (
    transactionId: string,
    updates: {
      serviceName: string;
      totalBill?: number;
      paidAmount?: number;
      dueAmount?: number;
      notes?: string;
      type?: 'baki' | 'joma';
      amount?: number;
    }
  ) => {
    const existingTx = khataTransactions.find(t => t.id === transactionId);
    if (!existingTx) return;

    setKhataTransactions(prev => {
      const nextTxList = prev.map(t => {
        if (t.id === transactionId) {
          const newType = updates.type || t.type;
          const newTotalBill = updates.totalBill !== undefined ? updates.totalBill : t.totalBill;
          const newPaid = updates.paidAmount !== undefined ? updates.paidAmount : t.paidAmount;
          const newDue = updates.dueAmount !== undefined ? updates.dueAmount : t.dueAmount;
          const newAmount = updates.amount !== undefined ? updates.amount : (newType === 'baki' ? (newDue || t.amount) : (newPaid || t.amount));

          return {
            ...t,
            ...updates,
            type: newType,
            totalBill: newTotalBill,
            paidAmount: newPaid,
            dueAmount: newDue,
            amount: newAmount
          };
        }
        return t;
      });

      const { totalDue, totalPaid } = computeCustomerLedgerBalance(existingTx.customerId, nextTxList);
      setKhataCustomers(cprev => cprev.map(k => k.id === existingTx.customerId ? { ...k, totalDue, totalPaid } : k));
      return nextTxList;
    });
  };

  const deleteKhataEntry = (transactionId: string) => {
    const tx = khataTransactions.find(t => t.id === transactionId);
    if (!tx) return;

    setKhataTransactions(prev => {
      const nextTxList = prev.filter(t => t.id !== transactionId);
      const { totalDue, totalPaid } = computeCustomerLedgerBalance(tx.customerId, nextTxList);
      setKhataCustomers(cprev => cprev.map(k => k.id === tx.customerId ? { ...k, totalDue, totalPaid } : k));
      return nextTxList;
    });
  };

  // 4. Live Session & Terminal Calculations
  const calculateLiveBill = (station: Station, asOfTime: number = currentTime): LiveSessionBill => {
    const session = station.currentSession;
    if (!session) {
      return { durationMinutes: 0, timeCharge: 0, ordersCharge: 0, subtotal: 0, discountAmount: 0, taxAmount: 0, totalAmount: 0, isOverdue: false, remainingMinutes: 0, elapsedSeconds: 0 };
    }

    const effectiveNow = session.pauseTime ? session.pauseTime : asOfTime;
    const grossElapsedMs = Math.max(0, effectiveNow - session.startTime);
    const activeElapsedMs = Math.max(0, grossElapsedMs - (session.totalPausedDurationMs || 0));
    const elapsedSeconds = Math.floor(activeElapsedMs / 1000);
    const rawMinutes = Math.floor(elapsedSeconds / 60);

    let durationMinutes = rawMinutes;
    if (settings.autoRoundMinutes && durationMinutes > 0) {
      const rem = durationMinutes % 5;
      if (rem > 0) durationMinutes += (5 - rem);
    }

    let timeCharge = 0;
    let isOverdue = false;
    let remainingMinutes: number | undefined = undefined;

    if (session.type === 'prepaid' && session.allocatedMinutes) {
      const allocated = session.allocatedMinutes;
      const hourlyRate = station.hourlyRate;
      timeCharge = Number(((allocated / 60) * hourlyRate).toFixed(2));
      remainingMinutes = allocated - rawMinutes;
      if (remainingMinutes < 0) {
        isOverdue = true;
        const overtime = Math.abs(remainingMinutes);
        timeCharge += Number(((overtime / 60) * hourlyRate).toFixed(2));
      }
    } else {
      const hours = Math.max(0, durationMinutes / 60);
      timeCharge = Number((hours * station.hourlyRate).toFixed(2));
    }

    const ordersCharge = session.orders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const subtotal = Number((timeCharge + ordersCharge).toFixed(2));
    const discountRate = session.discountPct ? session.discountPct / 100 : 0;
    const discountAmount = Number((subtotal * discountRate).toFixed(2));
    const taxable = Math.max(0, subtotal - discountAmount);
    const taxAmount = Number((taxable * (settings.taxRatePct / 100)).toFixed(2));
    const totalAmount = Number((taxable + taxAmount).toFixed(2));

    return {
      durationMinutes: Math.max(1, rawMinutes),
      timeCharge,
      ordersCharge: Number(ordersCharge.toFixed(2)),
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      isOverdue,
      remainingMinutes,
      elapsedSeconds
    };
  };

  const startSession = (stationId: string, params: {
    customerName: string;
    customerPhone?: string;
    memberId?: string;
    type: SessionType;
    allocatedMinutes?: number;
    notes?: string;
  }) => {
    let isMember = false;
    let memberTier: 'Bronze' | 'Silver' | 'Gold' | 'VIP Diamond' | undefined = undefined;
    let discountPct = 0;

    if (params.memberId) {
      const member = members.find(m => m.id === params.memberId);
      if (member) {
        isMember = true;
        memberTier = member.tier;
        discountPct = member.discountPct;
      }
    }

    const newSession: ActiveSession = {
      id: `sess-${Date.now()}`,
      stationId,
      customerName: params.customerName.trim() || 'Guest Customer',
      customerPhone: params.customerPhone?.trim(),
      memberId: params.memberId,
      isMember,
      memberTier,
      discountPct,
      type: params.type,
      allocatedMinutes: params.allocatedMinutes,
      startTime: Date.now(),
      totalPausedDurationMs: 0,
      orders: [],
      notes: params.notes?.trim()
    };

    setStations(prev => prev.map(s => s.id === stationId ? { ...s, status: 'in_use', currentSession: newSession } : s));
  };

  const pauseSession = (stationId: string) => {
    setStations(prev => prev.map(s => {
      if (s.id === stationId && s.currentSession && s.status === 'in_use') {
        return { ...s, status: 'paused', currentSession: { ...s.currentSession, pauseTime: Date.now() } };
      }
      return s;
    }));
  };

  const resumeSession = (stationId: string) => {
    setStations(prev => prev.map(s => {
      if (s.id === stationId && s.currentSession && s.status === 'paused') {
        const pauseTime = s.currentSession.pauseTime || Date.now();
        const pauseDuration = Date.now() - pauseTime;
        return {
          ...s,
          status: 'in_use',
          currentSession: {
            ...s.currentSession,
            pauseTime: undefined,
            totalPausedDurationMs: (s.currentSession.totalPausedDurationMs || 0) + pauseDuration
          }
        };
      }
      return s;
    }));
  };

  const extendSession = (stationId: string, addedMinutes: number) => {
    setStations(prev => prev.map(s => {
      if (s.id === stationId && s.currentSession) {
        const cur = s.currentSession.allocatedMinutes || 60;
        return {
          ...s,
          currentSession: { ...s.currentSession, type: 'prepaid', allocatedMinutes: cur + addedMinutes }
        };
      }
      return s;
    }));
  };

  const transferStation = (fromStationId: string, toStationId: string): boolean => {
    const from = stations.find(s => s.id === fromStationId);
    const to = stations.find(s => s.id === toStationId);
    if (!from || !to || !from.currentSession || to.status !== 'available') return false;

    const moving = { ...from.currentSession, stationId: toStationId };
    setStations(prev => prev.map(s => {
      if (s.id === fromStationId) return { ...s, status: 'cleaning', currentSession: undefined };
      if (s.id === toStationId) return { ...s, status: 'in_use', currentSession: moving };
      return s;
    }));
    return true;
  };

  const setStationStatus = (stationId: string, status: StationStatus) => {
    setStations(prev => prev.map(s => s.id === stationId ? { ...s, status, currentSession: status === 'available' ? undefined : s.currentSession } : s));
  };

  const addOrderToStation = (stationId: string, orderItems: { productId: string; quantity: number }[]) => {
    const newItems: SessionOrderItem[] = [];
    setProducts(prev => {
      const next = [...prev];
      orderItems.forEach(o => {
        const idx = next.findIndex(p => p.id === o.productId);
        if (idx !== -1 && o.quantity > 0) {
          const prod = next[idx];
          next[idx] = { ...prod, stock: Math.max(0, prod.stock - o.quantity) };
          newItems.push({
            id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            itemId: prod.id,
            name: prod.name,
            category: prod.category,
            price: prod.price,
            quantity: o.quantity,
            orderedAt: Date.now()
          });
        }
      });
      return next;
    });

    setStations(prev => prev.map(s => {
      if (s.id === stationId && s.currentSession) {
        return {
          ...s,
          currentSession: { ...s.currentSession, orders: [...s.currentSession.orders, ...newItems] }
        };
      }
      return s;
    }));
  };

  const checkoutStation = (stationId: string, paymentMethod: PaymentMethod, notes?: string, customDiscountPct?: number): TransactionReceipt | null => {
    const station = stations.find(s => s.id === stationId);
    if (!station || !station.currentSession) return null;

    const session = station.currentSession;
    const bill = calculateLiveBill(station);
    const receiptNum = `REC-CAB-${Math.floor(1000 + Math.random() * 9000)}`;

    const discountPct = customDiscountPct !== undefined ? customDiscountPct : (session.isMember ? session.discountPct : 0);
    const discountAmount = Number(((bill.subtotal * discountPct) / 100).toFixed(2));
    const taxable = Math.max(0, bill.subtotal - discountAmount);
    const taxAmount = Number(((taxable * (settings.taxRatePct / 100))).toFixed(2));
    const totalAmount = Number((taxable + taxAmount).toFixed(2));

    const receipt: TransactionReceipt = {
      id: `tx-${Date.now()}`,
      receiptNumber: receiptNum,
      stationId: station.id,
      stationName: station.name,
      customerName: session.customerName,
      customerPhone: session.customerPhone,
      isMember: session.isMember,
      memberId: session.memberId,
      startTime: session.startTime,
      endTime: Date.now(),
      durationMinutes: bill.durationMinutes,
      hourlyRate: station.hourlyRate,
      timeCharge: bill.timeCharge,
      ordersCharge: bill.ordersCharge,
      orders: session.orders,
      subtotal: bill.subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: 'paid',
      operatorName: settings.operatorName,
      timestamp: Date.now()
    };

    setTransactions(prev => [receipt, ...prev]);
    setCurrentShift(prev => ({
      ...prev,
      cashRevenue: paymentMethod === 'cash' ? Number((prev.cashRevenue + receipt.totalAmount).toFixed(2)) : prev.cashRevenue,
      qrRevenue: paymentMethod === 'qr_pay' ? Number((prev.qrRevenue + receipt.totalAmount).toFixed(2)) : prev.qrRevenue,
      totalRevenue: Number((prev.totalRevenue + receipt.totalAmount).toFixed(2)),
      sessionsCompleted: prev.sessionsCompleted + 1
    }));

    setStations(prev => prev.map(s => s.id === stationId ? { ...s, status: 'available', currentSession: undefined } : s));
    setActiveReceipt(receipt);
    return receipt;
  };

  const directPosCheckout = (
    items: { productId: string; quantity: number; name?: string; price?: number; category?: any }[],
    paymentMethod: PaymentMethod,
    customerName: string = 'Walk-in Customer',
    memberId?: string,
    customDiscountPct?: number
  ): TransactionReceipt => {
    const orderItems: SessionOrderItem[] = [];
    let subtotal = 0;

    setProducts(prevProducts => {
      const next = [...prevProducts];
      items.forEach(order => {
        const pIndex = next.findIndex(p => p.id === order.productId);
        if (pIndex !== -1 && order.quantity > 0) {
          const prod = next[pIndex];
          next[pIndex] = { ...prod, stock: Math.max(0, prod.stock - order.quantity) };
          subtotal += prod.price * order.quantity;
          orderItems.push({
            id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            itemId: prod.id,
            name: prod.name,
            category: prod.category,
            price: prod.price,
            quantity: order.quantity,
            orderedAt: Date.now()
          });
        } else if (order.quantity > 0) {
          // Dynamic Rate Chart Item or Custom Stock Item
          const itemPrice = order.price !== undefined ? order.price : 0;
          subtotal += itemPrice * order.quantity;
          orderItems.push({
            id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            itemId: order.productId,
            name: order.name || 'Service Item',
            category: order.category || 'printing',
            price: itemPrice,
            quantity: order.quantity,
            orderedAt: Date.now()
          });
        }
      });
      return next;
    });

    const discountPct = customDiscountPct || 0;
    const discountAmount = Number(((subtotal * discountPct) / 100).toFixed(2));
    const taxable = Math.max(0, subtotal - discountAmount);
    const taxAmount = Number(((taxable * (settings.taxRatePct / 100))).toFixed(2));
    const totalAmount = Number((taxable + taxAmount).toFixed(2));

    const receiptNum = `POS-${Math.floor(1000 + Math.random() * 9000)}`;
    const receipt: TransactionReceipt = {
      id: `tx-pos-${Date.now()}`,
      receiptNumber: receiptNum,
      customerName,
      isMember: Boolean(memberId),
      memberId,
      endTime: Date.now(),
      durationMinutes: 0,
      timeCharge: 0,
      ordersCharge: subtotal,
      orders: orderItems,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: 'paid',
      operatorName: settings.operatorName,
      timestamp: Date.now()
    };

    setTransactions(prev => [receipt, ...prev]);
    setCurrentShift(prev => ({
      ...prev,
      cashRevenue: paymentMethod === 'cash' ? Number((prev.cashRevenue + totalAmount).toFixed(2)) : prev.cashRevenue,
      qrRevenue: paymentMethod === 'qr_pay' ? Number((prev.qrRevenue + totalAmount).toFixed(2)) : prev.qrRevenue,
      totalRevenue: Number((prev.totalRevenue + totalAmount).toFixed(2)),
      posOrdersCount: prev.posOrdersCount + orderItems.length
    }));

    setActiveReceipt(receipt);
    return receipt;
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p));
  };

  const addProduct = (product: Omit<PosProduct, 'id'>) => {
    setProducts(prev => [...prev, { ...product, id: `p-${Date.now()}` }]);
  };

  const updateProduct = (productId: string, updates: Partial<PosProduct>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const recordQuickPrintJob = ({
    monochromePages,
    colorPages,
    scanPages,
    targetStationId,
    customerName = 'Print Client',
    paymentMethod = 'cash'
  }: {
    monochromePages: number;
    colorPages: number;
    scanPages: number;
    targetStationId?: string;
    customerName?: string;
    paymentMethod?: PaymentMethod;
  }) => {
    const orders: { productId: string; quantity: number }[] = [];
    const pMono = products.find(p => p.id === 'p-1' || p.category === 'printing');
    if (monochromePages > 0 && pMono) orders.push({ productId: pMono.id, quantity: monochromePages });

    if (targetStationId) {
      addOrderToStation(targetStationId, orders);
    } else {
      directPosCheckout(orders, paymentMethod, customerName);
    }
  };

  // 6. Members
  const addMember = (memberData: Omit<Member, 'id' | 'memberCode' | 'totalSpent' | 'hoursLogged' | 'joinedDate'>): Member => {
    const codeNum = 100 + members.length + 1;
    const newMember: Member = {
      ...memberData,
      id: `m-${Date.now()}`,
      memberCode: `NS-${codeNum}`,
      totalSpent: 0,
      hoursLogged: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setMembers(prev => [newMember, ...prev]);
    return newMember;
  };

  const topupMemberBalance = (memberId: string, amount: number, paymentMethod: PaymentMethod) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, balance: Number((m.balance + amount).toFixed(2)) } : m));
    setCurrentShift(prev => ({
      ...prev,
      cashRevenue: paymentMethod === 'cash' ? Number((prev.cashRevenue + amount).toFixed(2)) : prev.cashRevenue,
      totalRevenue: Number((prev.totalRevenue + amount).toFixed(2))
    }));
  };

  const closeShift = (actualCash: number, notes?: string) => {
    setCurrentShift(prev => ({
      ...prev,
      endedAt: Date.now(),
      actualCashCounted: actualCash,
      notes: notes || prev.notes,
      status: 'closed'
    }));
  };

  const startNewShift = (operatorName: string, startingCash: number) => {
    setCurrentShift({
      id: `shift-${Date.now()}`,
      operatorName,
      startedAt: Date.now(),
      startingCash,
      cashRevenue: 0,
      cardRevenue: 0,
      walletRevenue: 0,
      qrRevenue: 0,
      totalRevenue: 0,
      sessionsCompleted: 0,
      serviceOrdersCompleted: 0,
      posOrdersCount: 0,
      status: 'active'
    });
  };

  const updateSettings = (updates: Partial<CafeSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetToDemoData = () => {
    setServiceOrders(INITIAL_SERVICE_ORDERS);
    setRateChart(INITIAL_RATE_CHART);
    setKhataCustomers(INITIAL_KHATA_CUSTOMERS);
    setKhataTransactions(INITIAL_KHATA_TRANSACTIONS);
    setStations(INITIAL_STATIONS);
    setProducts(INITIAL_PRODUCTS);
    setMembers(INITIAL_MEMBERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    setCurrentShift(INITIAL_SHIFT);
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  };

  return (
    <CyberCafeContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentTime,
        settings,
        updateSettings,
        resetToDemoData,
        isAdminAuthenticated,
        adminPin,
        loginAdmin,
        logoutAdmin,
        serviceOrders,
        addServiceOrder,
        updateServiceOrder,
        updateServiceOrderStatus,
        updateServiceOrderPayment,
        deleteServiceOrder,
        selectedOrder,
        setSelectedOrder,
        rateChart,
        addRateChartItem,
        updateRateChartItem,
        deleteRateChartItem,
        khataCustomers,
        khataTransactions,
        addKhataCustomer,
        updateKhataCustomer,
        deleteKhataCustomer,
        addKhataEntry,
        editKhataEntry,
        deleteKhataEntry,
        selectedKhataCustomerId,
        setSelectedKhataCustomerId,
        selectedKhataTransaction,
        setSelectedKhataTransaction,
        stations,
        selectedStationId,
        setSelectedStationId,
        startSession,
        pauseSession,
        resumeSession,
        extendSession,
        transferStation,
        setStationStatus,
        addOrderToStation,
        checkoutStation,
        calculateLiveBill,
        products,
        updateProductStock,
        addProduct,
        updateProduct,
        deleteProduct,
        directPosCheckout,
        recordQuickPrintJob,
        members,
        addMember,
        topupMemberBalance,
        transactions,
        activeReceipt,
        setActiveReceipt,
        currentShift,
        closeShift,
        startNewShift,
        activeModal,
        openModal,
        closeModal
      }}
    >
      {children}
    </CyberCafeContext.Provider>
  );
};

export const useCyberCafe = () => {
  const context = useContext(CyberCafeContext);
  if (!context) throw new Error('useCyberCafe must be used within CyberCafeProvider');
  return context;
};
