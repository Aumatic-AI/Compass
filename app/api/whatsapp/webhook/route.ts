import { runConversation } from '@/lib/core/agent/runConversation';
import { loadClientConfig } from '@/lib/core/loadClientConfig';

// This is the URL you give to Twilio's "When a message comes in" field
// (sandbox settings page). It receives the exact same form-encoded
// payload the n8n Webhook node was receiving — this route just parses
// it directly instead of using an "Edit Fields" node.

export async function POST(req: Request) {
  const formData = await req.formData();

  const incoming = {
    name: (formData.get('ProfileName') as string) || 'Unknown',
    phone: ((formData.get('From') as string) || '').replace('whatsapp:+', ''),
    message: (formData.get('Body') as string) || '',
  };

  if (!incoming.phone || !incoming.message) {
    return new Response('Missing phone or message', { status: 400 });
  }

  const config = loadClientConfig();

  try {
    await runConversation(incoming, config);
  } catch (err) {
    console.error('runConversation failed:', err);
    // Note: we still return 200 to Twilio so it doesn't retry-storm us;
    // the error is logged server-side for us to investigate.
  }

  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
  status: 200,
  headers: { 'Content-Type': 'text/xml' },
});
}
