import { supabase } from '@/lib/core/db/client';
import { DashboardConfig } from './dashboard-config/types';

// ---------------------------------------------------------------
// CATALOG — REAL.
// ---------------------------------------------------------------

export type CatalogGroup = {
  groupName: string;
  items: { name: string; meta: string; available: boolean }[];
};

export async function getCatalogGroups(config: DashboardConfig): Promise<CatalogGroup[]> {
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) throw error;
  if (!products) return [];

  const groups = new Map<string, CatalogGroup>();
  for (const product of products) {
    const groupName = product[config.catalogGroupBy] || 'Uncategorized';
    if (!groups.has(groupName)) groups.set(groupName, { groupName, items: [] });

    const metaParts = config.catalogFields.map((f) => {
      if (f.key === 'price') {
        const price = product.price;
        if (price === null || price === undefined) return 'price not set';
        const symbol = product.currency === 'USD' ? '$' : '₹';
        return `${symbol}${price}`;
      }
      const value = product[f.key];
      return value ? String(value) : `${f.label}: —`;
    });

    groups.get(groupName)!.items.push({
      name: product.name,
      meta: metaParts.join(' · '),
      available: !!product.available,
    });
  }
  return Array.from(groups.values());
}

// ---------------------------------------------------------------
// RAW PRODUCTS — powers the editable Catalog Manager (edit/rename/delete)
// and the WhatsApp Commerce catalog feed.
// ---------------------------------------------------------------

export type RawProduct = {
  id: string;
  name: string;
  category: string | null;
  pack_size: string | null;
  order_type: string | null;
  price: number | null;
  currency: string | null;
  available: boolean;
  image_url: string | null;
};

export async function getRawProducts(): Promise<RawProduct[]> {
  const { data, error } = await supabase.from('products').select('*').order('name');
  if (error) throw error;
  return data || [];
}

// ---------------------------------------------------------------
// CONVERSATIONS — REAL, from `messages` + `customers`.
// ---------------------------------------------------------------

export type ConversationPreview = {
  phone: string;
  name: string;
  initials: string;
  time: string;
  preview: string;
  flag: 'wait' | 'ai' | 'human';
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export async function getRealConversations(limit = 10): Promise<ConversationPreview[]> {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) throw error;
  if (!messages || messages.length === 0) return [];

  const { data: customers } = await supabase.from('customers').select('phone, full_name');
  const nameByPhone = new Map<string, string>();
  (customers || []).forEach((c) => nameByPhone.set(c.phone, c.full_name || c.phone));

  const latestByPhone = new Map<string, (typeof messages)[number]>();
  for (const m of messages) {
    if (!latestByPhone.has(m.customer_phone)) latestByPhone.set(m.customer_phone, m);
  }

  return Array.from(latestByPhone.values())
    .slice(0, limit)
    .map((m) => {
      const name = nameByPhone.get(m.customer_phone) || m.customer_phone;
      return {
        phone: m.customer_phone,
        name,
        initials: initialsFrom(name),
        time: timeAgo(m.created_at),
        preview: m.message,
        flag: (m.role === 'user' ? 'wait' : 'ai') as 'wait' | 'ai',
      };
    });
}

// ---------------------------------------------------------------
// FULL CHAT THREAD for one customer.
// ---------------------------------------------------------------

export type ThreadMessage = { role: 'user' | 'assistant'; message: string; time: string };

export async function getConversationThread(phone: string): Promise<{ name: string; phone: string; messages: ThreadMessage[] }> {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('customer_phone', phone)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const { data: customer } = await supabase
    .from('customers')
    .select('full_name')
    .eq('phone', phone)
    .maybeSingle();

  return {
    name: customer?.full_name || phone,
    phone,
    messages: (messages || []).map((m) => ({
      role: m.role,
      message: m.message,
      time: new Date(m.created_at).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit',
      }),
    })),
  };
}

// ---------------------------------------------------------------
// MOCK DATA — orders/payments/deliveries tables don't exist yet.
// ---------------------------------------------------------------

export function getMockStats() {
  return { orders_today: '42', revenue_today: '₹86,400', pending: '7', fulfilled_today: '35', reviews: '12' };
}

export function getMockOrders() {
  return [
    { order_id: '#2046', customer: 'Priya Reddy', phone: '+91 98480 xxxxx', items: '1 kg Tapeswaram Kaja', tag: { text: 'Retail', tone: 'neutral' }, amount: '₹650', payment: { text: 'Paid', tone: 'paid' }, fulfillment: { text: 'Delivered', tone: 'paid' }, tracking: 'SR48213904' },
    { order_id: '#2047', customer: 'Suresh Rao', phone: '+91 90107 xxxxx', items: 'Festival Assortment — Kaja, Putharekulu', tag: { text: 'Gift', tone: 'shipped' }, amount: '₹2,850', payment: { text: 'Paid', tone: 'paid' }, fulfillment: { text: 'Shipped', tone: 'shipped' }, tracking: 'SR48214112' },
    { order_id: '#2048', customer: 'Anita Menon', phone: '+91 99485 xxxxx', items: '250g Putharekulu', tag: { text: 'Retail', tone: 'neutral' }, amount: '₹320', payment: { text: 'Link sent', tone: 'pending' }, fulfillment: { text: 'Awaiting payment', tone: 'pending' }, tracking: '' },
  ];
}

export function getMockBroadcast() {
  return {
    template: 'Festival Offer — Sankranti Gift Hampers 15% Off',
    segments: [
      { label: 'Past gifting orders (198)', active: true },
      { label: 'Bulk/festival buyers (34)', active: false },
      { label: 'All customers (512)', active: false },
    ],
    recipientCount: 198,
    feePerRecipient: 0.9,
  };
}

// ---------------------------------------------------------------
// CALLS — REAL, from ElevenLabs Conversational AI conversation history.
// ---------------------------------------------------------------

export type CallRecord = {
  id: string; // conversation_id
  name: string;
  phone: string;
  timeAgo: string;
  startedAt: string; // ISO string, for "today" filtering
  duration: string; // "1:42"
  durationSecs: number;
  status: 'completed' | 'missed' | 'failed' | 'in_progress';
  hasAudio: boolean;
};

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function callTimeAgo(unixSecs: number): string {
  const diffMs = Date.now() - unixSecs * 1000;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function mapCallStatus(status: string, callSuccessful: string, durationSecs: number): CallRecord['status'] {
  if (status === 'initiated' || status === 'in-progress' || status === 'processing') return 'in_progress';
  if (durationSecs < 4) return 'missed'; // picked up but essentially no conversation
  if (callSuccessful === 'failure' || status === 'failed') return 'failed';
  return 'completed';
}

export async function getRealCalls(): Promise<CallRecord[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID; // set this if you only want this one agent's calls

  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not set');

  const url = new URL('https://api.elevenlabs.io/v1/convai/conversations');
  url.searchParams.set('page_size', '30');
  if (agentId) url.searchParams.set('agent_id', agentId);

  const res = await fetch(url.toString(), {
    headers: { 'xi-api-key': apiKey },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ElevenLabs conversations request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const conversations = data.conversations || [];

  const { data: customers } = await supabase.from('customers').select('phone, full_name');
  const nameByPhone = new Map<string, string>();
  (customers || []).forEach((c) => {
    if (c.phone) nameByPhone.set(c.phone.replace(/\D/g, ''), c.full_name || c.phone);
  });

  const detailed = await Promise.all(
    conversations.map(async (c: any) => {
      let phone = 'Unknown number';
      let hasAudio = false;
      try {
        const detailRes = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversations/${c.conversation_id}`,
          { headers: { 'xi-api-key': apiKey }, cache: 'no-store' }
        );
        if (detailRes.ok) {
          const detail = await detailRes.json();
          const callerId =
            detail?.conversation_initiation_client_data?.dynamic_variables?.system__caller_id;
          if (callerId) phone = callerId;
          hasAudio = !!detail?.has_audio;
        }
      } catch {
        // if a single detail fetch fails, keep going with 'Unknown number'
      }

      const digitsOnly = phone.replace(/\D/g, '');
      const name = nameByPhone.get(digitsOnly) || phone;

      const durationSecs = c.call_duration_secs || 0;

      return {
        id: c.conversation_id,
        name,
        phone,
        timeAgo: callTimeAgo(c.start_time_unix_secs),
        startedAt: new Date(c.start_time_unix_secs * 1000).toISOString(),
        duration: formatDuration(durationSecs),
        durationSecs,
        status: mapCallStatus(c.status, c.call_successful, durationSecs),
        hasAudio,
      } as CallRecord;
    })
  );

  return detailed.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}
