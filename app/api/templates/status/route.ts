import { NextResponse } from "next/server";
import { listTemplates } from "@/lib/whatsapp";

export async function GET() {
  try {
    const result = await listTemplates();

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // result.data is an array of templates, each with: name, status, category, language, rejected_reason
    return NextResponse.json({ templates: result.data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
