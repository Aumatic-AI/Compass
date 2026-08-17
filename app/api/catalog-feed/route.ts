import { NextResponse } from 'next/server';
import { getRawProducts } from '@/lib/dashboard-data';

// Shown to customers as the "visit site" link on each product card.
// Update this if you ever want per-product pages instead of one
// shared link for everything.
const WEBSITE_URL = 'https://www.originallytapeswaram.in/';

function csvEscape(value: string): string {
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export async function GET() {
  const products = await getRawProducts();

  const header = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link'];
  const rows: string[] = [header.join(',')];

  let skippedNoImage = 0;
  let skippedNoPrice = 0;

  for (const p of products) {
    // Meta rejects any listing without an image — skip rather than
    // submit an invalid row that would just get bounced anyway.
    if (!p.image_url) {
      skippedNoImage++;
      continue;
    }
    if (p.price === null || p.price === undefined) {
      skippedNoPrice++;
      continue;
    }

    const currency = (p.currency || 'INR').toUpperCase();
    const price = `${p.price.toFixed(2)} ${currency}`;

    const descriptionParts = [p.category, p.pack_size].filter(Boolean);
    const description = descriptionParts.length > 0 ? descriptionParts.join(' · ') : p.name;

    const row = [
      p.id,
      p.name,
      description,
      p.available ? 'in stock' : 'out of stock',
      'new',
      price,
      WEBSITE_URL,
      p.image_url,
    ].map((v) => csvEscape(String(v)));

    rows.push(row.join(','));
  }

  const csv = rows.join('\n');

  // Not shown to Meta, but useful if you open this URL yourself to
  // sanity-check it before pointing Commerce Manager at it.
  console.log(
    `[catalog-feed] ${rows.length - 1} products included, ${skippedNoImage} skipped (no image), ${skippedNoPrice} skipped (no price)`
  );

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      // Meta only polls hourly at best anyway, no benefit to a shorter cache.
      'Cache-Control': 'public, max-age=1800',
    },
  });
}
