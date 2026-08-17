// lib/whatsapp-number.ts
//
// Fetches the REAL connected WhatsApp Business number from Meta's
// Graph API, using the same WHATSAPP_PHONE_NUMBER_ID and
// WHATSAPP_ACCESS_TOKEN you already have in .env.local. No number
// is ever hardcoded — whatever's actually connected to that phone
// number ID is what gets displayed, every time the dashboard loads.

const GRAPH_API_VERSION = 'v21.0';

export async function getConnectedWhatsAppNumber(): Promise<string> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    return 'Not configured';
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}?fields=display_phone_number,verified_name`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store', // always fetch the live value, never a stale cached one
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error(`[whatsapp-number] Graph API request failed (${res.status}): ${text}`);
      return 'Unavailable';
    }

    const data = await res.json();
    return data.display_phone_number || 'Unavailable';
  } catch (err) {
    console.error('[whatsapp-number] Error fetching connected number:', err);
    return 'Unavailable';
  }
}
