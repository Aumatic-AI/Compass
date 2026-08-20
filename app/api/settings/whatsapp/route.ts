// app/api/settings/whatsapp/route.ts
import { supabase } from '@/lib/core/db/client';

// TEMPORARY: until proper multi-tenant login exists, we always read/write
// a single row for "your" business. Once you have multiple real clients,
// swap this for the logged-in user's actual client_id.
const SINGLE_CLIENT_BUSINESS_NAME = 'Suruchi Foods';

export async function GET() {
  const { data, error } = await supabase
    .from('client_accounts')
    .select('*')
    .eq('business_name', SINGLE_CLIENT_BUSINESS_NAME)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ account: data });
}

export async function POST(req: Request) {
  const body = await req.json();

  const record = {
    business_name: body.business_name || SINGLE_CLIENT_BUSINESS_NAME,
    whatsapp_access_token: body.whatsapp_access_token || null,
    whatsapp_phone_number_id: body.whatsapp_phone_number_id || null,
    whatsapp_waba_id: body.whatsapp_waba_id || null,
    connection_status: body.connection_status || 'disconnected',
    razorpay_key_id: body.razorpay_key_id || null,
    razorpay_key_secret: body.razorpay_key_secret || null,
    twilio_account_sid: body.twilio_account_sid || null,
    twilio_auth_token: body.twilio_auth_token || null,
    twilio_whatsapp_from: body.twilio_whatsapp_from || null,
    openai_api_key: body.openai_api_key || null,
    elevenlabs_api_key: body.elevenlabs_api_key || null,
    elevenlabs_agent_id: body.elevenlabs_agent_id || null,
  };

  const { data: existing } = await supabase
    .from('client_accounts')
    .select('id')
    .eq('business_name', record.business_name)
    .maybeSingle();

  let result;
  if (existing) {
    result = await supabase
      .from('client_accounts')
      .update(record)
      .eq('id', existing.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from('client_accounts')
      .insert(record)
      .select()
      .single();
  }

  if (result.error) {
    return Response.json({ error: result.error.message }, { status: 500 });
  }
  return Response.json({ account: result.data });
}
