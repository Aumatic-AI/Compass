import { NextRequest, NextResponse } from "next/server";
import { createTemplate } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const { name, category, language, bodyText } = await req.json();

    if (!name || !category || !language || !bodyText) {
      return NextResponse.json(
        { error: "Missing required fields: name, category, language, bodyText" },
        { status: 400 }
      );
    }

    // WhatsApp requires template names to be lowercase with underscores only
    const normalizedName = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");

    const result = await createTemplate({
      name: normalizedName,
      category,
      language,
      bodyText,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: result.id, status: result.status });
  } catch (err: any) {
    return NextResponse.json({
  success: true,
  id: result.id,
  status: result.status,
  rejected_reason: result.rejected_reason,
});
  }
}
