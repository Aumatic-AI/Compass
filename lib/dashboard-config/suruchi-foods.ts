import { DashboardConfig } from './types';

export const suruchiFoodsConfig: DashboardConfig = {
  clientId: 'suruchi-foods',
  brandName: 'Compass Dashboard',
  brandEyebrow: 'COMPASS · BUSINESS CONTROL CENTER',
  whatsappNumber: '+1 (415) 523-8886',

  theme: {
    primary: '#2F6FED',
    primaryDark: '#1E4FBF',
    accent: '#58C4FF',
  },

  statCards: [
    { key: 'orders_today', label: 'Orders Today' },
    { key: 'revenue_today', label: 'Revenue Today' },
    { key: 'pending', label: 'Pending Payment' },
    { key: 'fulfilled_today', label: 'Delivered Today' },
    { key: 'reviews', label: 'New Reviews' },
  ],

  orderColumns: [
    { key: 'order_id', label: 'Order' },
    { key: 'customer', label: 'Customer' },
    { key: 'items', label: 'Items' },
    { key: 'tag', label: 'Gift?' },
    { key: 'amount', label: 'Amount' },
    { key: 'payment', label: 'Payment' },
    { key: 'fulfillment', label: 'Delivery' },
    { key: 'tracking', label: 'Tracking ID' },
  ],
  orderTagLabel: 'Gift?',

  catalogLabel: 'Product Catalog',
  catalogGroupBy: 'category',
  catalogFields: [
    { key: 'pack_size', label: 'Pack size' },
    { key: 'price', label: 'Price' },
  ],

  broadcastLabel: 'Broadcast & Offer Campaign',

  enabledPanels: ['order_feed', 'broadcast', 'live_conversations', 'catalog', 'calls'],
};
