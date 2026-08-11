import { NextResponse } from 'next/server';
import { getRealCalls } from '@/lib/dashboard-data';

export async function GET() {
  try {
    const calls = await getRealCalls();
    return NextResponse.json({ calls });
  } catch (err: any) {
    console.error('Failed to fetch calls:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to load calls' },
      { status: 500 }
    );
  }
}