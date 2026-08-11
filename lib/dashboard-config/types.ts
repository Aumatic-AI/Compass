// The shape every client/vertical config must follow.
// The dashboard page (app/dashboard/page.tsx) NEVER hardcodes a brand
// name, color, label, or panel — it only reads from a config object
// shaped like this. Swap the config, swap the business.

export type StatCardConfig = {
  key: 'orders_today' | 'revenue_today' | 'pending' | 'fulfilled_today' | 'reviews';
  label: string;       // e.g. "Orders Today" vs "Consultations Today"
  soft?: boolean;       // renders as the lighter "attention" card style
};

export type CatalogFieldConfig = {
  key: string;          // matches a column on the products table, or a key inside `attributes`
  label: string;        // shown as meta text, e.g. "Pack size" vs "Dosage"
};

export type OrderColumnConfig = {
  key: 'order_id' | 'customer' | 'items' | 'tag' | 'amount' | 'payment' | 'fulfillment' | 'tracking';
  label: string;        // e.g. "Delivery" vs "Pickup Slot", "Tracking ID" vs "Rx Verified By"
};

export type PanelKey =
  | 'order_feed'
  | 'broadcast'
  | 'live_conversations'
  | 'catalog'
  | 'calls';

export type DashboardConfig = {
  clientId: string;
  brandName: string;
  brandEyebrow: string;         // small label above brand name, e.g. "Repeatless · Owner Dashboard"
  whatsappNumber: string;

  theme: {
    primary: string;             // main brand color (was --maroon)
    primaryDark: string;         // (was --maroon-dark)
    accent: string;              // (was --saffron)
  };

  statCards: StatCardConfig[];

  orderColumns: OrderColumnConfig[];
  orderTagLabel: string;         // header text for the "tag" column, e.g. "Gift?" vs "Refill?"

  catalogLabel: string;          // panel title, e.g. "Product Catalog" vs "Medicine Inventory"
  catalogGroupBy: string;        // which column groups catalog items, e.g. "category"
  catalogFields: CatalogFieldConfig[];

  broadcastLabel: string;        // e.g. "Broadcast & Offer Campaign" vs "Refill Reminder Campaign"

  enabledPanels: PanelKey[];      // which panels this vertical actually wants shown
};
