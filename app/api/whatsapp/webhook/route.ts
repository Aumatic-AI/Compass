import { runConversation } from '@/lib/core/agent/runConversation';
import { loadClientConfig } from '@/lib/core/loadClientConfig';
import { supabase } from '@/lib/core/db/client';

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

// Meta calls this once when you save the webhook config, and periodically
// after that, to prove you own this URL. Must echo back hub.challenge.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

// Meta sends this on every incoming message / status update.
export async function POST(req: Request) {
  const body = await req.json();

  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];

  // Not every webhook call is a message (delivery receipts, etc.) — ignore those.
  if (!message) {
    return new Response('EVENT_RECEIVED', { status: 200 });
  }

  // Idempotency check — Meta's own message id, prevents double-processing
  const messageId = message.id as string;
  const { data: seen } = await supabase
    .from('processed_messages')
    .select('sid')
    .eq('sid', messageId)
    .maybeSingle();
  if (seen) {
    return new Response('EVENT_RECEIVED', { status: 200 });
  }
  await supabase.from('processed_messages').insert({ sid: messageId });

  const profileName = value?.contacts?.[0]?.profile?.name || 'Unknown';
  const fromPhone = message.from as string;
  const text = message.text?.body || '';

  if (!fromPhone || !text) {
    return new Response('EVENT_RECEIVED', { status: 200 });
  }

  const incoming = { name: profileName, phone: fromPhone, message: text };
  const config = loadClientConfig();

  try {
    await runConversation(incoming, config);
  } catch (err) {
    console.error('runConversation failed:', err);
  }

  return new Response('EVENT_RECEIVED', { status: 200 });
}