// lib/core/integrations/whatsapp.ts
//
// Sends messages via Meta's WhatsApp Cloud API directly (no Twilio).

const GRAPH_API_VERSION = 'v21.0';
const MAX_WHATSAPP_BODY = 4096;

function splitMessage(message: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < message.length) {
    let end = Math.min(start + maxLength, message.length);
    if (end === message.length) {
      chunks.push(message.slice(start).trim());
      break;
    }
    let splitAt = message.lastIndexOf('\n', end);
    if (splitAt <= start) splitAt = message.lastIndexOf(' ', end);
    if (splitAt <= start) splitAt = end;
    chunks.push(message.slice(start, splitAt).trim());
    start = splitAt;
  }
  return chunks.filter(Boolean);
}

export async function sendWhatsAppMessage(toPhone: string, message: string) {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error('META_WHATSAPP_TOKEN or META_PHONE_NUMBER_ID is not set');
  }

  const chunks = splitMessage(message, MAX_WHATSAPP_BODY);

  for (const chunk of chunks) {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: toPhone,
          type: 'text',
          text: { body: chunk },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Meta send failed: ${res.status} ${errText}`);
    }
  }
}