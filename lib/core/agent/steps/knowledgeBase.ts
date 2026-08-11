import { supabase } from '@/lib/core/db/client';

// Replaces the n8n "Get many rows1" + "Aggregate" nodes for knowledge_base.
// Fetches every Q&A pair — the AI does the matching by meaning,
// not the database by exact text, so wording/capitalization differences
// (the bug we hit in n8n) are handled naturally here.

export async function getKnowledgeBaseText(): Promise<string> {
  const { data: rows, error } = await supabase.from('knowledge_base').select('*');

  if (error) throw error;
  if (!rows || rows.length === 0) return '(no knowledge base entries yet)';

  return rows.map((r) => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n');
}
