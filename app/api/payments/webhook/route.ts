import { supabase } from '@/lib/core/db/client';

// Razorpay calls this URL when a payment succeeds. It marks the order
// paid and can trigger a "team notified" message — expand this once
// the orders/payments tables are added (see README "Next steps").

export async function POST(req: Request) {
  const payload = await req.json();

  const orderId = payload?.payload?.payment_link?.entity?.notes?.order_id;
  const status = payload?.payload?.payment_link?.entity?.status;

  if (orderId && status === 'paid') {
    // Example — adjust once your `payments` / `orders` tables exist:
    // await supabase.from('payments').update({ status: 'paid' }).eq('order_id', orderId);
    console.log(`Order ${orderId} marked as paid.`);
  }

  return new Response('OK', { status: 200 });
}
