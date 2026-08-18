// app/api/settings/whatsapp/test/route.ts
//
// Verifies credentials actually work by asking Meta about the phone number
// itself — a lightweight, read-only call, doesn't send any message.

export async function POST(req: Request) {
  const { whatsapp_access_token, whatsapp_phone_number_id } = await req.json();

  if (!whatsapp_access_token || !whatsapp_phone_number_id) {
    return Response.json(
      { success: false, error: 'Both access token and phone number ID are required.' },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${whatsapp_phone_number_id}?fields=display_phone_number,verified_name`,
      {
        headers: { Authorization: `Bearer ${whatsapp_access_token}` },
      }
    );
    const data = await res.json();

    if (!res.ok) {
      return Response.json(
        { success: false, error: data?.error?.message || 'Meta rejected these credentials.' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: `Verified — ${data.verified_name || 'number'} (${data.display_phone_number || 'unknown'})`,
    });
  } catch (err) {
    return Response.json(
      { success: false, error: 'Could not reach Meta — check your network or the token.' },
      { status: 500 }
    );
  }
}
