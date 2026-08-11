import { supabase } from '@/lib/core/db/client';

// Replaces the n8n "Get Products" + "Aggregate Products" nodes.
// Fetches the whole live catalog and formats it as plain text
// the AI can read directly — no exact-match filtering needed.

export async function getCatalogText(): Promise<string> {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('available', true);

  if (error) throw error;
  if (!products || products.length === 0) return '(no products loaded yet)';

  return products
    .map((p) => {
      const price =
        p.price === null
          ? 'price not set yet'
          : `${p.currency === 'USD' ? '$' : '₹'}${p.price}`;
      return `${p.name} (${p.category}, ${p.pack_size}, ${p.order_type}) — ${price}`;
    })
    .join('\n');
}
