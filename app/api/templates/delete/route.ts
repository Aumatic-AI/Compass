import { NextRequest, NextResponse } from "next/server";
import { deleteTemplate } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 });
    }
    const result = await deleteTemplate(name);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}