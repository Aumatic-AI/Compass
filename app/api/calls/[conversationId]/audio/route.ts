import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversations/${params.conversationId}/audio`,
    { headers: { 'xi-api-key': apiKey } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Recording not available' }, { status: res.status });
  }

  const audioBuffer = await res.arrayBuffer();
  return new NextResponse(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'private, max-age=3600',
    },
  });
}