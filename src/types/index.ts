/**
 * NetSeva Cyber Cafe & CSC Digital Seva Suite - Type Definitions
 */

export type ServiceCategory =
  | 'pvc_card'
  | 'pan_card'
  | 'aadhaar'
  | 'voter'
  | 'driving_licence'
  | 'form_fillup'
  | 'certificate'
  | 'other';

export type ServiceOrderStatus =
  | 'received'
  | 'processing'
  | 'submitted'
  | 'printed_ready'
  | 'delivered'
  | 'cancelled';

export interface ServiceOrder {
  id: string;
  tokenNumber: string; // e.g. ORD-1042
  customerName: string;
  customerPhone: string;
  customerVillage?: string;
  serviceCategory: ServiceCategory;
  serviceName: string;
  cardType?: string; // Aadhaar PVC, Voter PVC, PAN PVC, etc.
  status: ServiceOrderStatus;
  ackNumber?: string; // NSDL/UTI Ack No, NVSP Ref No, etc.
  totalFee: number;
  advancePaid: number;
  dueAmount: number;
  paymentStatus: 'paid' | 'partial' | 'due';
  photoUrl?: string; // Data URL for PAN / Customer photo
  signatureUrl?: string; // Data URL for customer signature
  documentUrl?: string; // Attachment (Aadhaar/Proof)
  documentFileName?: string;
  notes?: string;
  isOnlineOrder?: boolean; // Submitted via Customer Public Portal
  paymentProofUrl?: string; // Cropped UPI payment screenshot / receipt
  paymentUtr?: string; // UPI UTR or Transaction reference number
  paymentMode?: 'cash' | 'upi' | 'due' | 'online';
  createdAt: number;
  deliveredAt?: number;
}

export type RateChartCategory =
  | 'pvc_cards'
  | 'pan_services'
  | 'aadhaar_services'
  | 'voter_services'
  | 'driving_licence'
  | 'online_forms'
  | 'print_xerox'
  | 'banking_bill';

export interface RateChartItem {
  id: string;
  category: RateChartCategory;
  serviceName: string;
  serviceNameBn?: string;
  customerRate: number; // in INR
  govtFee?: number;
  durationDays?: string; // e.g. "Instant (15 mins)", "7-10 Days"
  requiredDocuments: string[];
  isPopular?: boolean;
}

export interface KhataCustomer {
  id: string;
  name: string;
  phone: string;
  village: string; // Village / Para / Ward
  totalDue: number; // বাকি
  totalPaid: number; // মোট জমা
  notes?: string;
  createdAt: number;
}

export interface KhataTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'baki' | 'joma'; // baki = credit given / due, joma = payment received
  amount: number; // net financial balance impact
  totalBill?: number; // মোট বিল (Total Bill for this work)
  paidAmount?: number; // কত টাকা দেওয়া হয়েছে (Amount Paid)
  dueAmount?: number; // কত বাকি আছে (Remaining Due)
  serviceName: string;
  notes?: string;
  timestamp: number;
}

// PC Terminal & Gaming Session Types
export type StationZone = 'standard' | 'esports' | 'vip_booth' | 'console_lounge';
export type StationStatus = 'available' | 'in_use' | 'paused' | 'cleaning' | 'maintenance';
export type SessionType = 'open' | 'prepaid';

export interface StationSpecs {
  cpu: string;
  gpu: string;
  ram: string;
  display: string;
  peripherals: string;
}

export interface SessionOrderItem {
  id: string;
  itemId: string;
  name: string;
  category: 'beverage' | 'snack' | 'meal' | 'printing' | 'accessory';
  price: number;
  quantity: number;
  orderedAt: number;
}

export interface ActiveSession {
  id: string;
  stationId: string;
  customerName: string;
  customerPhone?: string;
  memberId?: string;
  isMember: boolean;
  memberTier?: 'Bronze' | 'Silver' | 'Gold' | 'VIP Diamond';
  discountPct: number;
  type: SessionType;
  allocatedMinutes?: number;
  startTime: number;
  pauseTime?: number;
  totalPausedDurationMs: number;
  orders: SessionOrderItem[];
  notes?: string;
}

export interface Station {
  id: string;
  number: number;
  name: string;
  zone: StationZone;
  status: StationStatus;
  hourlyRate: number;
  specs: StationSpecs;
  currentSession?: ActiveSession;
}

export interface PosProduct {
  id: string;
  name: string;
  category: 'beverage' | 'snack' | 'meal' | 'printing' | 'accessory';
  price: number;
  cost: number;
  stock: number;
  unit: string;
  iconName: string;
}

export interface Member {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  email: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP Diamond';
  discountPct: number;
  balance: number;
  totalSpent: number;
  hoursLogged: number;
  joinedDate: string;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'wallet_balance' | 'qr_pay' | 'due' | 'khata';

export interface TransactionReceipt {
  id: string;
  receiptNumber: string;
  stationId?: string;
  stationName?: string;
  customerName: string;
  customerPhone?: string;
  isMember: boolean;
  memberId?: string;
  memberCode?: string;
  startTime?: number;
  endTime: number;
  durationMinutes: number;
  hourlyRate?: number;
  timeCharge: number;
  ordersCharge: number;
  orders: SessionOrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending';
  operatorName: string;
  timestamp: number;
  serviceOrderId?: string;
}

export interface CafeSettings {
  cafeName: string;
  tagline: string;
  address: string;
  phone: string;
  cscId?: string; // CSC VLE ID or Digital Seva Kendra ID
  upiQrId?: string; // e.g. cybercafe@upi
  wifiSsid: string;
  wifiPassword: string;
  currencySymbol: string;
  taxRatePct: number;
  autoRoundMinutes: boolean;
  gracePeriodMinutes: number;
  operatorName: string;
  operatorRole: string;
  monochromePrintRate: number;
  colorPrintRate: number;
  scanRate: number;
}

export interface ShiftSummary {
  id: string;
  operatorName: string;
  startedAt: number;
  endedAt?: number;
  startingCash: number;
  actualCashCounted?: number;
  cashRevenue: number;
  cardRevenue: number;
  walletRevenue: number;
  qrRevenue: number;
  totalRevenue: number;
  sessionsCompleted: number;
  serviceOrdersCompleted: number;
  posOrdersCount: number;
  notes?: string;
  status: 'active' | 'closed';
}
