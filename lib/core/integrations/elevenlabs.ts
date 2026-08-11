// lib/core/integrations/elevenlabs.ts
//
// Helper functions for talking to the ElevenLabs Conversational AI API.
// Used by the /api/agent-settings routes to power the dashboard's
// "Agent Settings" page (edit prompt, upload knowledge base files).

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    throw new Error('ELEVENLABS_API_KEY is not set in .env.local');
  }
  return key;
}

function getAgentId(): string {
  const id = process.env.ELEVENLABS_AGENT_ID;
  if (!id) {
    throw new Error('ELEVENLABS_AGENT_ID is not set in .env.local');
  }
  return id;
}

// ---------- Agent: read current config ----------

export async function getAgent() {
  const res = await fetch(`${ELEVENLABS_BASE_URL}/convai/agents/${getAgentId()}`, {
    method: 'GET',
    headers: {
      'xi-api-key': getApiKey(),
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch agent: ${res.status} ${errText}`);
  }

  return res.json();
}

// ---------- Agent: update system prompt ----------

export async function updateAgentPrompt(newPrompt: string) {
  const res = await fetch(`${ELEVENLABS_BASE_URL}/convai/agents/${getAgentId()}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': getApiKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_config: {
        agent: {
          prompt: {
            prompt: newPrompt,
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update agent prompt: ${res.status} ${errText}`);
  }

  return res.json();
}

// ---------- Agent: update voice ----------

export async function updateAgentVoice(voiceId: string) {
  const res = await fetch(`${ELEVENLABS_BASE_URL}/convai/agents/${getAgentId()}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': getApiKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_config: {
        tts: {
          voice_id: voiceId,
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update agent voice: ${res.status} ${errText}`);
  }

  return res.json();
}

// ---------- Knowledge base: create document from an uploaded file ----------

export async function createKnowledgeBaseFromFile(file: File, name: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);

  const res = await fetch(`${ELEVENLABS_BASE_URL}/convai/knowledge-base/file`, {
    method: 'POST',
    headers: {
      'xi-api-key': getApiKey(),
      // NOTE: do not set Content-Type manually here â€” fetch sets the
      // correct multipart boundary automatically when body is FormData.
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create knowledge base document: ${res.status} ${errText}`);
  }

  return res.json(); // returns { id, name, ... }
}

// ---------- Knowledge base: create document from plain text ----------

export async function createKnowledgeBaseFromText(text: string, name: string) {
  const res = await fetch(`${ELEVENLABS_BASE_URL}/convai/knowledge-base/text`, {
    method: 'POST',
    headers: {
      'xi-api-key': getApiKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, name }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create knowledge base text document: ${res.status} ${errText}`);
  }

  return res.json();
}

// ---------- Voices: list all available voices ----------

export async function listVoices() {
  const res = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
    method: 'GET',
    headers: {
      'xi-api-key': getApiKey(),
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch voices: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.voices ?? [];
}

// ---------- Knowledge base: delete a document ----------
//
// force=true removes it even if an agent currently depends on it
// (and also removes it from that agent's knowledge base list).

export async function deleteKnowledgeBaseDocument(documentId: string) {
  const res = await fetch(
    `${ELEVENLABS_BASE_URL}/convai/knowledge-base/${documentId}?force=true`,
    {
      method: 'DELETE',
      headers: {
        'xi-api-key': getApiKey(),
      },
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete knowledge base document: ${res.status} ${errText}`);
  }

  return { success: true };
}

// ---------- Knowledge base: attach a document to the agent ----------
//
// After creating a document (from file or text), call this to make the
// agent actually use it. This works by reading the agent's current
// knowledge base list, adding the new document, and saving.

export async function attachKnowledgeBaseDocument(documentId: string, documentName: string) {
  const agent = await getAgent();

  const existingKb =
    agent?.conversation_config?.agent?.prompt?.knowledge_base ?? [];

  const updatedKb = [
    ...existingKb,
    {
      id: documentId,
      name: documentName,
      type: 'file', // or 'text' / 'url' depending on source; 'file' is a safe default
    },
  ];

  const res = await fetch(`${ELEVENLABS_BASE_URL}/convai/agents/${getAgentId()}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': getApiKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_config: {
        agent: {
          prompt: {
            knowledge_base: updatedKb,
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to attach knowledge base document: ${res.status} ${errText}`);
  }

  return res.json();
}
