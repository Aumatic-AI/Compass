// app/api/agent-settings/voices/route.ts
//
// GET -> returns the list of available ElevenLabs voices, so the
// dashboard can show a dropdown to pick which voice the agent uses.

import { NextResponse } from 'next/server';
import { listVoices } from '@/lib/core/integrations/elevenlabs';

export async function GET() {
  try {
    const voices = await listVoices();

    // Trim down to just what the dropdown needs
    const simplified = voices.map((v: any) => ({
      voice_id: v.voice_id,
      name: v.name,
      preview_url: v.preview_url,
    }));

    return NextResponse.json({ voices: simplified });
  } catch (error: any) {
    console.error('GET /api/agent-settings/voices error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}
