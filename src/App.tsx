/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CyberCafeProvider, useCyberCafe } from './context/CyberCafeContext';
import { Header } from './components/layout/Header';

// Main Views
import { OrdersView } from './components/orders/OrdersView';
import { RateChartView } from './components/ratechart/RateChartView';
import { KhataView } from './components/khata/KhataView';
import { PosCounter } from './components/pos/PosCounter';
import { TransactionHistory } from './components/history/TransactionHistory';
import { SettingsView } from './components/settings/SettingsView';
import { CustomerPortalView } from './components/customer/CustomerPortalView';
import { LoginPage } from './components/auth/LoginPage';

import { AdminHeaderBanner } from './components/layout/AdminHeaderBanner';

// Chatbot Assistant
import { AfrinaChatBot } from './components/chat/AfrinaChatBot';

// Modals
import { NewOrderModal } from './components/orders/NewOrderModal';
import { EditOrderModal } from './components/orders/EditOrderModal';
import { OrderDetailsModal } from './components/orders/OrderDetailsModal';
import { NewKhataCustomerModal } from './components/khata/NewKhataCustomerModal';
import { EditKhataCustomerModal } from './components/khata/EditKhataCustomerModal';
import { KhataEntryModal } from './components/khata/KhataEntryModal';
import { EditKhataEntryModal } from './components/khata/EditKhataEntryModal';
import { CheckoutModal } from './components/billing/CheckoutModal';
import { PrintableReceiptModal } from './components/billing/PrintableReceiptModal';
import { QuickPrintModal } from './components/pos/QuickPrintModal';
import { InventoryManagerModal } from './components/pos/InventoryManagerModal';

const MainContent: React.FC = () => {
  const { activeTab, isAdminAuthenticated } = useCyberCafe();

  // Protect Admin-Only Sections (Khata, Orders, POS, Settings, Ledger)
  // Ensures ONLY Abu Kalam Sheikh can access or manage them!
  const adminOnlyTabs = ['orders', 'khata', 'pos', 'ledger', 'settings'];
  const isRestrictedTab = adminOnlyTabs.includes(activeTab);

  if (isRestrictedTab && !isAdminAuthenticated) {
    return (
      <div className="py-4">
        <LoginPage />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Admin Quick Panel Banner (when Abu Kalam Sheikh is logged in and not on public portal) */}
      {isAdminAuthenticated && activeTab !== 'portal' && <AdminHeaderBanner />}

      {/* Dynamic Tab Views */}
      {activeTab === 'orders' && <OrdersView />}
      {activeTab === 'pos' && <PosCounter />}
      {activeTab === 'ratechart' && <RateChartView />}
      {activeTab === 'khata' && <KhataView />}
      {activeTab === 'portal' && <CustomerPortalView />}
      {activeTab === 'login' && <LoginPage />}
      {activeTab === 'ledger' && <TransactionHistory />}
      {activeTab === 'settings' && <SettingsView />}

      {/* Global Modals */}
      <NewOrderModal />
      <EditOrderModal />
      <OrderDetailsModal />
      <NewKhataCustomerModal />
      <EditKhataCustomerModal />
      <KhataEntryModal />
      <EditKhataEntryModal />
      <CheckoutModal />
      <PrintableReceiptModal />
      <QuickPrintModal />
      <InventoryManagerModal />

      {/* Global Floating AI Seva & Xerox Chatbot Assistant */}
      <AfrinaChatBot isEmbedded={false} />
    </main>
  );
};

export default function App() {
  return (
    <CyberCafeProvider>
      <div className="min-h-screen bg-cyber-pattern text-slate-100 flex flex-col font-sans relative selection:bg-cyan-500/30 selection:text-cyan-200">
        <Header />
        <div className="flex-1">
          <MainContent />
        </div>
      </div>
    </CyberCafeProvider>
  );
}
