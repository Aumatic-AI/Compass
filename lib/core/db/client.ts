import { createClient } from '@supabase/supabase-js';

// One shared Supabase connection, used by every part of the app —
// the webhook, the AI agent, and the dashboard all read/write
// through this same client, exactly like the n8n Supabase nodes did.

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
