import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Replaces the n8n "AI Agent" + "OpenAI Chat Model" nodes.
// One plain function call — no visual wiring to misconfigure.

export async function callLLM(systemPrompt: string, userMessage: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || "Sorry, I don't have that information right now.";
}
