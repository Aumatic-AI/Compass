// app/api/agent-settings/route.ts
//
// GET  -> returns the agent's current system prompt + voice id
// PATCH -> updates the agent's system prompt (and/or voice)

import { NextRequest, NextResponse } from 'next/server';
import {
  getAgent,
  updateAgentPrompt,
  updateAgentVoice,
} from '@/lib/core/integrations/elevenlabs';

export async function GET() {
  try {
    const agent = await getAgent();

    const prompt =
      agent?.conversation_config?.agent?.prompt?.prompt ?? '';
    const firstMessage =
      agent?.conversation_config?.agent?.first_message ?? '';
    const voiceId =
      agent?.conversation_config?.tts?.voice_id ?? '';
    const name = agent?.name ?? '';
    const knowledgeBase =
      agent?.conversation_config?.agent?.prompt?.knowledge_base ?? [];

    return NextResponse.json({
      name,
      prompt,
      firstMessage,
      voiceId,
      knowledgeBase, // [{ id, name, type }, ...]
    });
  } catch (error: any) {
    console.error('GET /api/agent-settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch agent settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, voiceId } = body;

    if (prompt) {
      await updateAgentPrompt(prompt);
    }

    if (voiceId) {
      await updateAgentVoice(voiceId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PATCH /api/agent-settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update agent settings' },
      { status: 500 }
    );
  }
}
