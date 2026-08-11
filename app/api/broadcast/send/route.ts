import { NextRequest, NextResponse } from "next/server";
import { sendTemplateMessage } from "@/lib/whatsapp";

interface Recipient {
  phone: string;
  name?: string;
}

export async function POST(req: NextRequest) {
  try {
    const {
      recipients,
      templateName,
      languageCode = "en_US",
      bodyVariables = [],
    }: {
      recipients: Recipient[];
      templateName: string;
      languageCode?: string;
      bodyVariables?: string[];
    } = await req.json();

    if (!recipients?.length || !templateName) {
      return NextResponse.json(
        { error: "recipients (array) and templateName are required" },
        { status: 400 }
      );
    }

    const results: { phone: string; success: boolean; error?: string }[] = [];

    for (const recipient of recipients) {
      try {
        // If the template body has a {{1}} for the customer's name, use it automatically
        const variables = bodyVariables.length > 0 ? bodyVariables : [];

        const data = await sendTemplateMessage({
          to: recipient.phone,
          templateName,
          languageCode,
          bodyVariables: variables,
        });

        results.push({
          phone: recipient.phone,
          success: !!data.messages,
          error: data.error?.message,
        });
      } catch (err: any) {
        results.push({ phone: recipient.phone, success: false, error: err.message });
      }

      // Basic rate-limit safety margin. Standard tier allows ~80 msg/sec;
      // for larger lists, move this to a background queue instead of a single request.
      await new Promise((r) => setTimeout(r, 50));
    }

    const sentCount = results.filter((r) => r.success).length;
    const failedCount = results.length - sentCount;

    return NextResponse.json({
      total: results.length,
      sent: sentCount,
      failed: failedCount,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
