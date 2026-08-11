import { DashboardConfig } from './types';

export const glowPharmaConfig: DashboardConfig = {
  clientId: 'glow-pharma',
  brandName: 'Compass Dashboard',
  brandEyebrow: 'COMPASS · BUSINESS CONTROL CENTER',
  whatsappNumber: '+91 90000 55123',

  theme: {
    primary: '#2F6FED',
    primaryDark: '#1E4FBF',
    accent: '#58C4FF',
  },

  statCards: [
    { key: 'orders_today', label: 'Orders Today' },
    { key: 'revenue_today', label: 'Revenue Today' },
    { key: 'pending', label: 'Awaiting Rx Verification' },
    { key: 'fulfilled_today', label: 'Delivered Today' },
    { key: 'reviews', label: 'Refill Reminders Sent' },
  ],

  orderColumns: [
    { key: 'order_id', label: 'Order' },
    { key: 'customer', label: 'Patient' },
    { key: 'items', label: 'Medicines' },
    { key: 'tag', label: 'Rx Required?' },
    { key: 'amount', label: 'Amount' },
    { key: 'payment', label: 'Payment' },
    { key: 'fulfillment', label: 'Delivery' },
    { key: 'tracking', label: 'Verified By' },
  ],
  orderTagLabel: 'Rx Required?',

  catalogLabel: 'Medicine Inventory',
  catalogGroupBy: 'category',
  catalogFields: [
    { key: 'dosage', label: 'Dosage' },
    { key: 'price', label: 'Price' },
  ],

  broadcastLabel: 'Refill Reminder Campaign',

  enabledPanels: ['order_feed', 'live_conversations', 'catalog', 'calls'],
};
