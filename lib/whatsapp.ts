// Shared helpers for talking to the WhatsApp Cloud API.
// Requires these environment variables to be set in .env.local:
//   WHATSAPP_ACCESS_TOKEN
//   WHATSAPP_PHONE_NUMBER_ID
//   WHATSAPP_WABA_ID

const GRAPH_VERSION = "v22.0";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}. Add it to .env.local`);
  }
  return value;
}

export async function createTemplate(params: {
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string;
  bodyText: string;
}) {
  const wabaId = getEnv("WHATSAPP_WABA_ID");
  const token = getEnv("WHATSAPP_ACCESS_TOKEN");

  // Count how many {{n}} variables exist in the body text
  const variableMatches = params.bodyText.match(/\{\{\d+\}\}/g) || [];
  const variableCount = variableMatches.length;

  // Build the BODY component, including an "example" if variables are present
  const bodyComponent: any = {
    type: "BODY",
    text: params.bodyText,
  };

  if (variableCount > 0) {
    // Meta requires one example string per variable, in order
    const examples = Array.from({ length: variableCount }, (_, i) => `Example${i + 1}`);
    bodyComponent.example = {
      body_text: [examples],
    };
  }

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${wabaId}/message_templates`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: params.name,
        language: params.language,
        category: params.category,
        components: [bodyComponent],
      }),
    }
  );

  return res.json();
}
export async function listTemplates() {
  const wabaId = getEnv("WHATSAPP_WABA_ID");
  const token = getEnv("WHATSAPP_ACCESS_TOKEN");

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${wabaId}/message_templates?fields=name,status,category,language,components,rejected_reason&limit=100`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  return res.json();
}

export async function sendTemplateMessage(params: {
  to: string;
  templateName: string;
  languageCode: string;
  bodyVariables?: string[];
}) {
  const phoneNumberId = getEnv("WHATSAPP_PHONE_NUMBER_ID");
  const token = getEnv("WHATSAPP_ACCESS_TOKEN");

  const components = params.bodyVariables?.length
    ? [
        {
          type: "body",
          parameters: params.bodyVariables.map((v) => ({ type: "text", text: v })),
        },
      ]
    : [];

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: params.to,
        type: "template",
        template: {
          name: params.templateName,
          language: { code: params.languageCode },
          ...(components.length ? { components } : {}),
        },
      }),
    }
  );

  return res.json();
}
export async function deleteTemplate(name: string) {
  const wabaId = getEnv("WHATSAPP_WABA_ID");
  const token = getEnv("WHATSAPP_ACCESS_TOKEN");

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${wabaId}/message_templates?name=${name}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.json();
}