import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversations/${params.conversationId}`,
    { method: 'DELETE', headers: { 'xi-api-key': apiKey } }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Delete failed: ${text}` }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}