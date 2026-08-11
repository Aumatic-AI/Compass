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
        components: [
          {
            type: "BODY",
            text: params.bodyText,
          },
        ],
      }),
    }
  );

  return res.json();
}

export async function listTemplates() {
  const wabaId = getEnv("WHATSAPP_WABA_ID");
  const token = getEnv("WHATSAPP_ACCESS_TOKEN");

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${wabaId}/message_templates?fields=name,status,category,language,components,rejected_reason`,
    {
      headers: { Authorization: `Bearer ${token}` },
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
