import { supabase } from '@/lib/core/db/client';
import { getCatalogText } from './steps/catalog';
import { getKnowledgeBaseText } from './steps/knowledgeBase';
import { callLLM } from './callLLM';
import { sendWhatsAppMessage } from '@/lib/core/integrations/whatsapp';

type IncomingMessage = {
  name: string;
  phone: string;
  message: string;
};

// This one function replaces the entire n8n canvas:
// Webhook -> Edit Fields -> Get many rows -> If -> Create a row ->
// Create a row1 -> Get Products -> Aggregate -> Get many rows1 ->
// Aggregate -> AI Agent -> Create a row2 -> Send WhatsApp message
//
// Same steps, same order, just written as code instead of wired nodes.

export async function runConversation(incoming: IncomingMessage, config: any) {
  // 1. Find or create the customer
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', incoming.phone)
    .maybeSingle();

  if (!existingCustomer) {
    await supabase.from('customers').insert({
      full_name: incoming.name,
      phone: incoming.phone,
      segment: 'whatsapp',
    });
  }

  // 2. Log the incoming message
  await supabase.from('messages').insert({
    customer_phone: incoming.phone,
    role: 'user',
    message: incoming.message,
  });

  // 3. Gather live context for the AI (only what this client's config needs)
  let systemPrompt = config.system_prompt_template;

  if (config.workflow_steps.includes('catalog_and_kb')) {
    const products = await getCatalogText();
    const knowledgeBase = await getKnowledgeBaseText();
    systemPrompt = systemPrompt
      .replace('{{products}}', products)
      .replace('{{knowledge_base}}', knowledgeBase);
  }

  // 4. Ask the AI for a reply
  const reply = await callLLM(systemPrompt, incoming.message);

  // 5. Log the reply and send it back
  await supabase.from('messages').insert({
    customer_phone: incoming.phone,
    role: 'assistant',
    message: reply,
  });

  await sendWhatsAppMessage(incoming.phone, reply);

  return reply;
}
