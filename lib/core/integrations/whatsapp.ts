import twilio from 'twilio';

// ============================================================
// CURRENT: Twilio Sandbox — because Meta verification for the
// real client number isn't done yet. This is fine for development
// and testing; the sandbox number is shared, and testers must
// send "join <code>" first, same as in the n8n build.
//
// LATER: once Meta Business verification is complete, replace the
// contents of this file with a direct call to the Meta Cloud API
// (POST to graph.facebook.com/.../messages). Nothing else in the
// codebase needs to change — runConversation.ts just calls
// sendWhatsAppMessage() either way.
// ============================================================

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const MAX_WHATSAPP_BODY = 1500;

function splitMessage(message: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < message.length) {
    let end = Math.min(start + maxLength, message.length);

    if (end === message.length) {
      chunks.push(message.slice(start).trim());
      break;
    }

    let splitAt = message.lastIndexOf('\n', end);
    if (splitAt <= start) {
      splitAt = message.lastIndexOf(' ', end);
    }
    if (splitAt <= start) {
      splitAt = end;
    }

    chunks.push(message.slice(start, splitAt).trim());
    start = splitAt;
  }

  return chunks.filter(Boolean);
}

export async function sendWhatsAppMessage(toPhone: string, message: string) {
  const chunks = splitMessage(message, MAX_WHATSAPP_BODY);

  for (const chunk of chunks) {
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:+${toPhone}`,
      body: chunk,
    });
  }
}
