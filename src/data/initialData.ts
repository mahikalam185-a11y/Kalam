import {
  CafeSettings,
  Member,
  PosProduct,
  Station,
  TransactionReceipt,
  ShiftSummary,
  RateChartItem,
  ServiceOrder,
  KhataCustomer,
  KhataTransaction
} from '../types';

export const INITIAL_SETTINGS: CafeSettings = {
  cafeName: 'AFRINA INTERNET CAFE',
  tagline: 'Aadhaar, Voter, PAN PVC Card, Online Forms, Xerox & Digital Khata',
  address: 'BALI HATPARA NOWDA MSD 741156',
  phone: '8609550430',
  cscId: 'CSC-VLE-860955',
  upiQrId: '8609550430@ybl',
  wifiSsid: 'Afrina-Internet-Cafe',
  wifiPassword: 'afrinacafe8609',
  currencySymbol: '₹',
  taxRatePct: 0.0, // Most CSC small cyber cafes operate net inclusive
  autoRoundMinutes: true,
  gracePeriodMinutes: 5,
  operatorName: 'ABU KALAM SHEIKH',
  operatorRole: 'Cafe Owner & CSC VLE Operator',
  monochromePrintRate: 3.00,
  colorPrintRate: 10.00,
  scanRate: 10.00,
};

export const INITIAL_RATE_CHART: RateChartItem[] = [
  // PVC Smart Card Printing
  {
    id: 'rc-1',
    category: 'pvc_cards',
    serviceName: 'Aadhaar PVC Card Print (Dual Side Plastic Card)',
    serviceNameBn: 'আধার পিভিসি কার্ড প্রিন্ট',
    customerRate: 70,
    govtFee: 0,
    durationDays: 'Same Day (15-20 Mins)',
    requiredDocuments: ['Aadhaar Number or Original PDF', 'Registered Mobile for OTP (or QR scan)'],
    isPopular: true
  },
  {
    id: 'rc-2',
    category: 'pvc_cards',
    serviceName: 'Voter ID PVC Card (EPIC Smart Card)',
    serviceNameBn: 'ভোটার আইডি পিভিসি কার্ড',
    customerRate: 70,
    govtFee: 0,
    durationDays: 'Same Day (15-20 Mins)',
    requiredDocuments: ['EPIC / Voter Card Number', 'State / District details'],
    isPopular: true
  },
  {
    id: 'rc-3',
    category: 'pvc_cards',
    serviceName: 'PAN Card PVC Instant Print',
    serviceNameBn: 'প্যান কার্ড পিভিসি প্রিন্ট',
    customerRate: 70,
    govtFee: 0,
    durationDays: 'Same Day (15-20 Mins)',
    requiredDocuments: ['PAN Number or e-PAN PDF', 'DOB & Father Name'],
    isPopular: true
  },
  {
    id: 'rc-4',
    category: 'pvc_cards',
    serviceName: 'Ayushman Bharat Golden Card PVC (PMJAY)',
    serviceNameBn: 'আয়ুষ্মান ভারত গোল্ডেন কার্ড',
    customerRate: 60,
    govtFee: 0,
    durationDays: 'Same Day',
    requiredDocuments: ['Ration Card / Aadhaar Card', 'PMJAY Beneficiary ID'],
    isPopular: true
  },
  {
    id: 'rc-5',
    category: 'pvc_cards',
    serviceName: 'Driving Licence Smart PVC Card',
    serviceNameBn: 'ড্রাইভিং লাইসেন্স পিভিসি কার্ড',
    customerRate: 80,
    govtFee: 0,
    durationDays: 'Same Day',
    requiredDocuments: ['DL Number', 'Date of Birth (Parivahan portal)'],
    isPopular: false
  },
  {
    id: 'rc-6',
    category: 'pvc_cards',
    serviceName: 'Digital Ration Card PVC Card',
    serviceNameBn: 'ডিজিটাল রেশন কার্ড পিভিসি',
    customerRate: 60,
    govtFee: 0,
    durationDays: 'Same Day',
    requiredDocuments: ['Ration Card Number', 'Aadhaar Link status'],
    isPopular: false
  },

  // PAN Card Services
  {
    id: 'rc-7',
    category: 'pan_services',
    serviceName: 'New PAN Card Application (NSDL / UTI Form 49A)',
    serviceNameBn: 'নতুন প্যান কার্ড আবেদন (ফর্ম ৪৯এ)',
    customerRate: 220,
    govtFee: 107,
    durationDays: '7 - 12 Working Days',
    requiredDocuments: ['Passport Size Photo (2 Copies)', 'Signature / Thumb impression', 'Aadhaar Card Copy', 'Mobile No'],
    isPopular: true
  },
  {
    id: 'rc-8',
    category: 'pan_services',
    serviceName: 'PAN Card Correction / Name / DOB / Father Name Update',
    serviceNameBn: 'প্যান কার্ড সংশোধন / কারেকশন',
    customerRate: 200,
    govtFee: 107,
    durationDays: '10 - 15 Days',
    requiredDocuments: ['Existing PAN Copy', 'Aadhaar Card with correct details', 'Proof of Change document'],
    isPopular: true
  },
  {
    id: 'rc-9',
    category: 'pan_services',
    serviceName: 'Instant e-PAN Download & Verification',
    serviceNameBn: 'তাৎক্ষণিক ই-প্যান ডাউনলোড',
    customerRate: 80,
    govtFee: 0,
    durationDays: 'Instant (10 Mins)',
    requiredDocuments: ['Aadhaar Number', 'Aadhaar Linked Mobile for OTP'],
    isPopular: false
  },
  {
    id: 'rc-10',
    category: 'pan_services',
    serviceName: 'Reprint Lost PAN Card Physical Delivery',
    serviceNameBn: 'হারিয়ে যাওয়া প্যান কার্ড রিপ্রিন্ট',
    customerRate: 120,
    govtFee: 50,
    durationDays: '7 - 10 Days',
    requiredDocuments: ['PAN Number', 'Aadhaar Number', 'Current Delivery Address'],
    isPopular: false
  },

  // Voter Services
  {
    id: 'rc-11',
    category: 'voter_services',
    serviceName: 'New Voter Card Registration (ECI Form 6)',
    serviceNameBn: 'নতুন ভোটার কার্ড আবেদন (ফর্ম ৬)',
    customerRate: 100,
    govtFee: 0,
    durationDays: '20 - 30 Days (By BLO)',
    requiredDocuments: ['Passport Photo', 'Age Proof (Aadhaar / 10th Admit)', 'Address Proof', 'Family Member EPIC'],
    isPopular: true
  },
  {
    id: 'rc-12',
    category: 'voter_services',
    serviceName: 'Voter Card Correction / Shifting (ECI Form 8)',
    serviceNameBn: 'ভোটার কার্ড সংশোধন (ফর্ম ৮)',
    customerRate: 80,
    govtFee: 0,
    durationDays: '15 - 25 Days',
    requiredDocuments: ['Existing Voter ID', 'Aadhaar Card with correct spelling', 'Mobile Number'],
    isPopular: false
  },
  {
    id: 'rc-13',
    category: 'voter_services',
    serviceName: 'e-EPIC Voter Card Download + Laminated Print',
    serviceNameBn: 'ভোটার কার্ড ডাউনলোড ও লেমিনেশন',
    customerRate: 40,
    govtFee: 0,
    durationDays: 'Instant (10 Mins)',
    requiredDocuments: ['EPIC Number or Form Reference Number', 'Mobile for OTP'],
    isPopular: false
  },

  // Aadhaar Services
  {
    id: 'rc-14',
    category: 'aadhaar_services',
    serviceName: 'Aadhaar Card Download + Glossy Photo Print + Lamination',
    serviceNameBn: 'আধার কার্ড ডাউনলোড + লেমিনেশন',
    customerRate: 40,
    govtFee: 0,
    durationDays: 'Instant (10 Mins)',
    requiredDocuments: ['Aadhaar No / Enrolment No', 'Aadhaar Linked Mobile for OTP'],
    isPopular: true
  },
  {
    id: 'rc-15',
    category: 'aadhaar_services',
    serviceName: 'Aadhaar Online Address Update Token Assistance',
    serviceNameBn: 'আধার ঠিকানা সংশোধন সহায়তা',
    customerRate: 80,
    govtFee: 50,
    durationDays: '5 - 7 Days',
    requiredDocuments: ['Aadhaar No', 'Valid Address Proof (Voter/Bank Passbook/Electricity bill)'],
    isPopular: false
  },

  // Driving Licence (DL) & Learner Licence (LL) Services
  {
    id: 'rc-ll-1',
    category: 'driving_licence',
    serviceName: 'Learner Licence (LL) New Application & Slot Booking (Parivahan)',
    serviceNameBn: 'লার্নার লাইসেন্স (LL) নতুন আবেদন ও স্লট বুকিং',
    customerRate: 250,
    govtFee: 150,
    durationDays: '1 - 2 Days',
    requiredDocuments: ['Aadhaar Card', 'Age Proof (10th Admit / Birth Cert)', 'Passport Photo & Signature', 'Blood Group'],
    isPopular: true
  },
  {
    id: 'rc-ll-2',
    category: 'driving_licence',
    serviceName: 'LL Online Test Prep & Mock Exam Assistance (Sarathi Traffic Signs)',
    serviceNameBn: 'LL অনলাইন কম্পিউটার টেস্ট ও মক পরীক্ষা প্রস্তুতি',
    customerRate: 100,
    govtFee: 0,
    durationDays: 'Instant (30 Mins)',
    requiredDocuments: ['LL Application Number', 'Traffic Signs syllabus'],
    isPopular: true
  },
  {
    id: 'rc-ll-3',
    category: 'driving_licence',
    serviceName: 'Learner Licence (LL) Plastic Smart PVC Card Print',
    serviceNameBn: 'লার্নার লাইসেন্স (LL) পিভিসি প্লাস্টিক কার্ড প্রিন্ট',
    customerRate: 70,
    govtFee: 0,
    durationDays: 'Instant (15 Mins)',
    requiredDocuments: ['Learner Licence (LL) Number', 'Date of Birth'],
    isPopular: true
  },
  {
    id: 'rc-ll-4',
    category: 'driving_licence',
    serviceName: 'LL to Permanent Driving Licence (DL) Online Application & RTO Test Slot',
    serviceNameBn: 'LL থেকে পাকা ড্রাইভিং লাইসেন্স (DL) আবেদন ও RTO স্লট',
    customerRate: 350,
    govtFee: 300,
    durationDays: '7 - 14 Days',
    requiredDocuments: ['Learner Licence Number (after 30 days of LL issue)', 'Vehicle details for RTO driving test'],
    isPopular: true
  },
  {
    id: 'rc-dl-1',
    category: 'driving_licence',
    serviceName: 'Permanent Driving Licence (DL) Smart PVC Plastic Card Print',
    serviceNameBn: 'ড্রাইভিং লাইসেন্স স্মার্ট পিভিসি কার্ড প্রিন্ট',
    customerRate: 80,
    govtFee: 0,
    durationDays: 'Instant (15 Mins)',
    requiredDocuments: ['DL Number', 'Date of Birth (Parivahan portal download)'],
    isPopular: true
  },
  {
    id: 'rc-dl-2',
    category: 'driving_licence',
    serviceName: 'Driving Licence Renewal, Address Update & Duplicate DL',
    serviceNameBn: 'ড্রাইভিং লাইসেন্স নবীকরণ ও ঠিকানা পরিবর্তন',
    customerRate: 220,
    govtFee: 200,
    durationDays: '5 - 10 Days',
    requiredDocuments: ['Expired / Existing DL', 'Medical Form 1-A (for >40 age)', 'Aadhaar Card'],
    isPopular: false
  },

  // Online Govt & Job Forms
  {
    id: 'rc-16',
    category: 'online_forms',
    serviceName: 'Sarkari / Govt Job Online Form Fillup (SSC, Railway, Police, WBPSC)',
    serviceNameBn: 'সরকারি চাকরির ফর্ম ফিলাপ',
    customerRate: 120,
    govtFee: 0,
    durationDays: 'Immediate',
    requiredDocuments: ['Marksheet, Certificates', 'Photo & Signature', 'Caste Certificate (if applicable)'],
    isPopular: true
  },
  {
    id: 'rc-17',
    category: 'online_forms',
    serviceName: 'Admit Card Download & 2-Copy Print',
    serviceNameBn: 'এডমিট কার্ড ডাউনলোড ও প্রিন্ট',
    customerRate: 25,
    govtFee: 0,
    durationDays: 'Instant',
    requiredDocuments: ['Application / Registration Number', 'Password / Date of Birth'],
    isPopular: true
  },
  {
    id: 'rc-18',
    category: 'online_forms',
    serviceName: 'College Admission & Scholarship Application (Oasis / SVMCM)',
    serviceNameBn: 'স্কলারশিপ ও কলেজ ভর্তি ফর্ম',
    customerRate: 100,
    govtFee: 0,
    durationDays: 'Same Day',
    requiredDocuments: ['Bank Passbook', 'Income Certificate', 'Previous Marksheet', 'Aadhaar'],
    isPopular: false
  },

  // Print, Xerox & Photos
  {
    id: 'rc-19',
    category: 'print_xerox',
    serviceName: 'Urgent Passport Size Photos (8 Copies Glossy Paper)',
    serviceNameBn: 'জরুরি পাসপোর্ট ছবি (৮ কপি)',
    customerRate: 40,
    govtFee: 0,
    durationDays: 'Instant (5 Mins)',
    requiredDocuments: ['Direct Camera Click or Mobile photo'],
    isPopular: true
  },
  {
    id: 'rc-20',
    category: 'print_xerox',
    serviceName: 'Black & White Xerox / Print (Per Page)',
    serviceNameBn: 'সাদা-কালো জেরক্স / প্রিন্ট (প্রতি পাতা)',
    customerRate: 3,
    govtFee: 0,
    durationDays: 'Instant',
    requiredDocuments: ['Original Document / PDF'],
    isPopular: true
  },
  {
    id: 'rc-21',
    category: 'print_xerox',
    serviceName: 'Color Laser Document Print (Per Page)',
    serviceNameBn: 'কালার লেজার প্রিন্ট',
    customerRate: 10,
    govtFee: 0,
    durationDays: 'Instant',
    requiredDocuments: ['PDF / Image / Word File'],
    isPopular: false
  },
  {
    id: 'rc-22',
    category: 'print_xerox',
    serviceName: 'Document Lamination (A4 / Voter / Certificate)',
    serviceNameBn: 'ডকুমেন্ট লেমিনেশন',
    customerRate: 20,
    govtFee: 0,
    durationDays: 'Instant',
    requiredDocuments: ['Original Paper Document'],
    isPopular: false
  },

  // Banking & Bill Payments
  {
    id: 'rc-23',
    category: 'banking_bill',
    serviceName: 'Electricity Bill Payment Online (Instant Receipt)',
    serviceNameBn: 'বিদ্যুৎ বিল পেমেন্ট',
    customerRate: 15,
    govtFee: 0,
    durationDays: 'Instant Receipt',
    requiredDocuments: ['Consumer ID / Electricity Bill copy'],
    isPopular: true
  },
  {
    id: 'rc-24',
    category: 'banking_bill',
    serviceName: 'Railway IRCTC Confirmed Ticket Booking Assistance',
    serviceNameBn: 'রেলের টিকিট বুকিং',
    customerRate: 60,
    govtFee: 0,
    durationDays: 'Instant',
    requiredDocuments: ['Passenger Name, Age, ID Details', 'Travel Date & Train No'],
    isPopular: false
  }
];

const now = Date.now();

export const INITIAL_SERVICE_ORDERS: ServiceOrder[] = [
  {
    id: 'ord-101',
    tokenNumber: 'SEVA-1021',
    customerName: 'Anup Mondal',
    customerPhone: '+91 98321 00412',
    customerVillage: 'Gobindapur Ward 4',
    serviceCategory: 'pan_card',
    serviceName: 'New PAN Card Application (Form 49A)',
    cardType: 'PAN Card Physical',
    status: 'submitted',
    ackNumber: 'NSDL-8839201490',
    totalFee: 220,
    advancePaid: 150,
    dueAmount: 70,
    paymentStatus: 'partial',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80',
    notes: 'Father: Dilip Mondal. Submitted to NSDL portal on 22 Oct.',
    createdAt: now - (2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'ord-102',
    tokenNumber: 'SEVA-1022',
    customerName: 'Priyanka Das',
    customerPhone: '+91 97334 88129',
    customerVillage: 'Station Para',
    serviceCategory: 'pvc_card',
    serviceName: 'Aadhaar PVC Card Print',
    cardType: 'Aadhaar PVC',
    status: 'printed_ready',
    totalFee: 70,
    advancePaid: 70,
    dueAmount: 0,
    paymentStatus: 'paid',
    notes: 'Printed on high-gloss thermal PVC blank card. Ready on counter drawer.',
    createdAt: now - (4 * 60 * 60 * 1000)
  },
  {
    id: 'ord-103',
    tokenNumber: 'SEVA-1023',
    customerName: 'Rabin Ghosh',
    customerPhone: '+91 94340 77156',
    customerVillage: 'Kashipur North',
    serviceCategory: 'voter',
    serviceName: 'Voter ID PVC Card (EPIC Smart Print)',
    cardType: 'Voter PVC',
    status: 'processing',
    ackNumber: 'EPIC-WB/14/092/104928',
    totalFee: 70,
    advancePaid: 0,
    dueAmount: 70,
    paymentStatus: 'due',
    notes: 'Customer asked to print both husband and wife cards.',
    createdAt: now - (2 * 60 * 60 * 1000)
  },
  {
    id: 'ord-104',
    tokenNumber: 'SEVA-1024',
    customerName: 'Subir Karmakar',
    customerPhone: '+91 89001 22340',
    customerVillage: 'Dakshinpara',
    serviceCategory: 'form_fillup',
    serviceName: 'Railway RRB Group D Online Application',
    status: 'received',
    totalFee: 120,
    advancePaid: 100,
    dueAmount: 20,
    paymentStatus: 'partial',
    notes: 'Need 10th marksheet and caste certificate scanning.',
    createdAt: now - (45 * 60 * 1000)
  }
];

export const INITIAL_KHATA_CUSTOMERS: KhataCustomer[] = [
  {
    id: 'k-1',
    name: 'Bimal Halder (Teacher)',
    phone: '+91 98322 11984',
    village: 'Gobindapur High School Para',
    totalDue: 180,
    totalPaid: 1450,
    notes: 'Regular customer for school question paper prints & xerox',
    createdAt: now - (60 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'k-2',
    name: 'Anup Mondal',
    phone: '+91 98321 00412',
    village: 'Gobindapur Ward 4',
    totalDue: 70,
    totalPaid: 420,
    notes: 'PAN card application pending balance ₹70',
    createdAt: now - (15 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'k-3',
    name: 'Rabin Ghosh',
    phone: '+91 94340 77156',
    village: 'Kashipur North',
    totalDue: 70,
    totalPaid: 210,
    notes: 'Voter PVC card order due',
    createdAt: now - (7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'k-4',
    name: 'Subir Karmakar',
    phone: '+91 89001 22340',
    village: 'Dakshinpara',
    totalDue: 20,
    totalPaid: 350,
    notes: 'Railway form fillup remaining ₹20',
    createdAt: now - (2 * 24 * 60 * 60 * 1000)
  }
];

export const INITIAL_KHATA_TRANSACTIONS: KhataTransaction[] = [
  {
    id: 'kt-1',
    customerId: 'k-1',
    customerName: 'Bimal Halder (Teacher)',
    type: 'baki',
    amount: 180,
    totalBill: 180,
    paidAmount: 0,
    dueAmount: 180,
    serviceName: 'School Examination Question Papers Xerox (60 pages)',
    notes: 'Will pay during salary time on 1st of month',
    timestamp: now - (1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'kt-2',
    customerId: 'k-2',
    customerName: 'Anup Mondal',
    type: 'baki',
    amount: 70,
    totalBill: 220,
    paidAmount: 150,
    dueAmount: 70,
    serviceName: 'New PAN Card Application Balance',
    notes: 'Total was ₹220, paid ₹150 advance, ₹70 due on card delivery',
    timestamp: now - (2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'kt-3',
    customerId: 'k-2',
    customerName: 'Anup Mondal',
    type: 'joma',
    amount: 150,
    totalBill: 220,
    paidAmount: 150,
    dueAmount: 70,
    serviceName: 'Cash Advance for PAN Card',
    notes: 'Received in cash',
    timestamp: now - (2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'kt-4',
    customerId: 'k-3',
    customerName: 'Rabin Ghosh',
    type: 'baki',
    amount: 70,
    totalBill: 70,
    paidAmount: 0,
    dueAmount: 70,
    serviceName: 'Voter PVC Card Order',
    notes: 'Will pay ₹70 during delivery',
    timestamp: now - (2 * 60 * 60 * 1000)
  }
];

// Retail Products & Stationery
export const INITIAL_PRODUCTS: PosProduct[] = [
  { id: 'p-1', name: 'Plastic Lamination Pouch (A4 125 Micron)', category: 'printing', price: 20, cost: 6, stock: 250, unit: 'pouch', iconName: 'FileText' },
  { id: 'p-2', name: 'Blank PVC Plastic Smart Card (Thermal Inkjet / Fargo)', category: 'printing', price: 70, cost: 15, stock: 180, unit: 'card', iconName: 'CreditCard' },
  { id: 'p-3', name: 'Urgent Passport Photo (8 Copies Glossy Sheet)', category: 'printing', price: 40, cost: 5, stock: 400, unit: 'sheet', iconName: 'Camera' },
  { id: 'p-4', name: 'A4 Stamp Size Envelope (Khaki / Green Cloth)', category: 'accessory', price: 10, cost: 3, stock: 120, unit: 'envelope', iconName: 'Mail' },
  { id: 'p-5', name: 'SanDisk 32GB Pendrive (Cruzer Blade USB 2.0)', category: 'accessory', price: 380, cost: 260, stock: 12, unit: 'piece', iconName: 'HardDrive' },
  { id: 'p-6', name: 'OTG Adapter (Type-C to USB 3.0)', category: 'accessory', price: 60, cost: 25, stock: 24, unit: 'piece', iconName: 'Cable' },
  { id: 'p-7', name: 'Cold Drink (Thums Up / Sprite 250ml)', category: 'beverage', price: 20, cost: 14, stock: 36, unit: 'bottle', iconName: 'Coffee' },
  { id: 'p-8', name: 'Tea / Hot Masala Chai', category: 'beverage', price: 10, cost: 4, stock: 50, unit: 'cup', iconName: 'Coffee' },
  { id: 'p-9', name: 'Biscuits / Cookies Snack Pack', category: 'snack', price: 10, cost: 7, stock: 40, unit: 'pack', iconName: 'Cookie' }
];

// Terminals for PC browsing, online form fillup and typing
export const INITIAL_STATIONS: Station[] = [
  {
    id: 'CAB-01',
    number: 1,
    name: 'Cabin 01 - Citizen Seva & Form Desk',
    zone: 'standard',
    status: 'in_use',
    hourlyRate: 30.00,
    specs: {
      cpu: 'Core i5-12400',
      gpu: 'Intel UHD 730 Graphics',
      ram: '16GB DDR4',
      display: '22" FHD IPS with Webcam & Biometric Scanner',
      peripherals: 'Mantra MFS100 Fingerprint + Morpho + Scanner'
    },
    currentSession: {
      id: 'sess-101',
      stationId: 'CAB-01',
      customerName: 'Bapi Barman',
      customerPhone: '+91 97321 44019',
      isMember: false,
      discountPct: 0,
      type: 'open',
      startTime: now - (42 * 60 * 1000),
      totalPausedDurationMs: 0,
      orders: [
        { id: 'ord-1', itemId: 'p-1', name: 'Black & White Xerox / Print', category: 'printing', price: 3, quantity: 8, orderedAt: now - (20 * 60 * 1000) }
      ],
      notes: 'Applying for SSC GD Constable online'
    }
  },
  {
    id: 'CAB-02',
    number: 2,
    name: 'Cabin 02 - Student Browsing & Typing',
    zone: 'standard',
    status: 'available',
    hourlyRate: 30.00,
    specs: {
      cpu: 'Core i5-12400',
      gpu: 'Intel UHD 730 Graphics',
      ram: '16GB DDR4',
      display: '22" FHD IPS Monitor',
      peripherals: 'TVS Gold Mechanical Keyboard + Logitech Mouse'
    }
  },
  {
    id: 'CAB-03',
    number: 3,
    name: 'Cabin 03 - Student Browsing & Typing',
    zone: 'standard',
    status: 'in_use',
    hourlyRate: 30.00,
    specs: {
      cpu: 'Core i5-12400',
      gpu: 'Intel UHD 730 Graphics',
      ram: '16GB DDR4',
      display: '22" FHD IPS Monitor',
      peripherals: 'Standard Keyboard + Mouse'
    },
    currentSession: {
      id: 'sess-103',
      stationId: 'CAB-03',
      customerName: 'Rana Sen',
      customerPhone: '+91 81160 33921',
      isMember: false,
      discountPct: 0,
      type: 'prepaid',
      allocatedMinutes: 60,
      startTime: now - (25 * 60 * 1000),
      totalPausedDurationMs: 0,
      orders: []
    }
  },
  {
    id: 'CAB-04',
    number: 4,
    name: 'Cabin 04 - High Speed Gaming & Design',
    zone: 'esports',
    status: 'available',
    hourlyRate: 50.00,
    specs: {
      cpu: 'Ryzen 5 5600X',
      gpu: 'GeForce RTX 3060 12GB',
      ram: '16GB DDR4 3600MHz',
      display: '24" 165Hz Fast IPS',
      peripherals: 'Mechanical RGB Keyboard + Gaming Headset'
    }
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm-1',
    memberCode: 'NS-101',
    name: 'Bimal Halder',
    phone: '+91 98322 11984',
    email: 'bimal.halder@gmail.com',
    tier: 'Gold',
    discountPct: 10,
    balance: 150.00,
    totalSpent: 3400.00,
    hoursLogged: 45.0,
    joinedDate: '2025-06-10',
    notes: 'School Teacher'
  },
  {
    id: 'm-2',
    memberCode: 'NS-102',
    name: 'Tanmoy Paul',
    phone: '+91 89004 33211',
    email: 'tanmoy.paul@yahoo.com',
    tier: 'Silver',
    discountPct: 5,
    balance: 40.00,
    totalSpent: 1200.00,
    hoursLogged: 22.0,
    joinedDate: '2025-09-14',
    notes: 'College Student'
  }
];

export const INITIAL_TRANSACTIONS: TransactionReceipt[] = [
  {
    id: 'tx-1001',
    receiptNumber: 'REC-IN-4921',
    customerName: 'Anup Mondal',
    customerPhone: '+91 98321 00412',
    isMember: false,
    startTime: now - (2 * 24 * 60 * 60 * 1000),
    endTime: now - (2 * 24 * 60 * 60 * 1000) + 15 * 60 * 1000,
    durationMinutes: 15,
    timeCharge: 0,
    ordersCharge: 150.00,
    orders: [
      { id: 'o-1', itemId: 'rc-7', name: 'New PAN Card Application (Form 49A) - Advance', category: 'printing', price: 150, quantity: 1, orderedAt: now }
    ],
    subtotal: 150.00,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 150.00,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    operatorName: 'Subhash Roy',
    timestamp: now - (2 * 24 * 60 * 60 * 1000),
    serviceOrderId: 'ord-101'
  },
  {
    id: 'tx-1002',
    receiptNumber: 'REC-IN-4922',
    customerName: 'Priyanka Das',
    customerPhone: '+91 97334 88129',
    isMember: false,
    startTime: now - (4 * 60 * 60 * 1000),
    endTime: now - (4 * 60 * 60 * 1000),
    durationMinutes: 0,
    timeCharge: 0,
    ordersCharge: 70.00,
    orders: [
      { id: 'o-2', itemId: 'rc-1', name: 'Aadhaar PVC Card Print (Plastic Smart Card)', category: 'printing', price: 70, quantity: 1, orderedAt: now }
    ],
    subtotal: 70.00,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 70.00,
    paymentMethod: 'qr_pay',
    paymentStatus: 'paid',
    operatorName: 'Subhash Roy',
    timestamp: now - (4 * 60 * 60 * 1000),
    serviceOrderId: 'ord-102'
  }
];

export const INITIAL_SHIFT: ShiftSummary = {
  id: 'shift-in-01',
  operatorName: 'Subhash Roy',
  startedAt: now - (4 * 60 * 60 * 1000),
  startingCash: 500.00,
  cashRevenue: 150.00,
  cardRevenue: 0.00,
  walletRevenue: 0.00,
  qrRevenue: 70.00,
  totalRevenue: 220.00,
  sessionsCompleted: 1,
  serviceOrdersCompleted: 2,
  posOrdersCount: 2,
  status: 'active'
};
