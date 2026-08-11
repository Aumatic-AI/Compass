// app/api/agent-settings/knowledge-base/route.ts
//
// POST -> accepts an uploaded file (PDF, TXT, DOCX, HTML, EPUB, or MD),
// creates it as a knowledge base document in ElevenLabs, and attaches
// it to the agent so the agent can use it to answer questions.

import { NextRequest, NextResponse } from 'next/server';
import {
  createKnowledgeBaseFromFile,
  attachKnowledgeBaseDocument,
  deleteKnowledgeBaseDocument,
} from '@/lib/core/integrations/elevenlabs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Basic size guard (ElevenLabs limit is 20MB per file)
    const MAX_SIZE_BYTES = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File is too large. Max size is 20MB.' },
        { status: 400 }
      );
    }

    const docName = file.name || 'Uploaded document';

    // 1. Create the document in ElevenLabs' knowledge base
    const created = await createKnowledgeBaseFromFile(file, docName);

    // 2. Attach it to our agent so it's actually used in conversations
    await attachKnowledgeBaseDocument(created.id, created.name || docName);

    return NextResponse.json({
      success: true,
      document: created,
    });
  } catch (error: any) {
    console.error('POST /api/agent-settings/knowledge-base error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload knowledge base document' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Missing document id' },
        { status: 400 }
      );
    }

    await deleteKnowledgeBaseDocument(documentId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/agent-settings/knowledge-base error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}
