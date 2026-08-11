'use client';

// app/dashboard/agent-settings/page.tsx
//
// Dashboard page for managing the ElevenLabs voice/chat agent directly
// from Compass — edit the system prompt, pick a voice, and manage
// knowledge base files — without needing to open ElevenLabs' dashboard.

import { useEffect, useState } from 'react';

type KnowledgeBaseDoc = {
  id: string;
  name: string;
  type?: string;
};

type Voice = {
  voice_id: string;
  name: string;
  preview_url?: string;
};

export default function AgentSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [agentName, setAgentName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseDoc[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    fetchAgentSettings();
    fetchVoices();
  }, []);

  async function fetchAgentSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/agent-settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load agent settings');

      setAgentName(data.name || '');
      setPrompt(data.prompt || '');
      setFirstMessage(data.firstMessage || '');
      setVoiceId(data.voiceId || '');
      setKnowledgeBase(data.knowledgeBase || []);
    } catch (err: any) {
      setStatusType('error');
      setStatusMessage(err.message || 'Could not load agent settings.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchVoices() {
    try {
      const res = await fetch('/api/agent-settings/voices');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load voices');
      setVoices(data.voices || []);
    } catch (err: any) {
      // Non-critical — voice list failing shouldn't block the whole page
      console.error('Could not load voices:', err.message);
    }
  }

  async function handleSave() {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/agent-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, voiceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      setStatusType('success');
      setStatusMessage('Agent updated successfully.');
    } catch (err: any) {
      setStatusType('error');
      setStatusMessage(err.message || 'Something went wrong while saving.');
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/agent-settings/knowledge-base', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setStatusType('success');
      setStatusMessage(`"${file.name}" added to the agent's knowledge base.`);
      await fetchAgentSettings(); // refresh the list
    } catch (err: any) {
      setStatusType('error');
      setStatusMessage(err.message || 'Something went wrong during upload.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDeleteDocument(docId: string, docName: string) {
    const confirmed = window.confirm(`Remove "${docName}" from the knowledge base?`);
    if (!confirmed) return;

    setDeletingId(docId);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/agent-settings/knowledge-base?id=${docId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      setStatusType('success');
      setStatusMessage(`"${docName}" removed.`);
      setKnowledgeBase((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      setStatusType('error');
      setStatusMessage(err.message || 'Could not delete this document.');
    } finally {
      setDeletingId(null);
    }
  }

  // ---------- shared inline style tokens ----------
  const cardStyle: React.CSSProperties = {
    backgroundColor: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '8px',
    padding: '12px 16px',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '8px',
  };
  const buttonPrimary: React.CSSProperties = {
    backgroundColor: '#2563eb',
    color: '#fff',
    fontWeight: 500,
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
  };
  const buttonSecondary: React.CSSProperties = {
    backgroundColor: '#111827',
    border: '1px solid #374151',
    color: '#fff',
    fontWeight: 500,
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'inline-block',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '32px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <p style={{ color: '#60a5fa', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
          Compass &middot; AgentBrain
        </p>
        <h1 style={{ fontSize: '30px', marginBottom: '4px', fontWeight: 700 }}>
          {agentName || 'AI Agent'}
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '32px' }}>
          Manage how your AI agent talks and what it knows &mdash; used for
          both WhatsApp chat and voice calls.
        </p>

        {loading ? (
          <p style={{ color: '#6b7280' }}>Loading agent settings&hellip;</p>
        ) : (
          <>
            {statusMessage && (
              <div
                style={{
                  marginBottom: '24px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: statusType === 'success' ? '#052e16' : '#450a0a',
                  color: statusType === 'success' ? '#4ade80' : '#f87171',
                  border: `1px solid ${statusType === 'success' ? '#166534' : '#991b1b'}`,
                }}
              >
                {statusMessage}
              </div>
            )}

            {/* First message (read-only preview) */}
            {firstMessage && (
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>First message customers hear</label>
                <div style={{ ...cardStyle, color: '#d1d5db', fontSize: '14px' }}>
                  {firstMessage}
                </div>
              </div>
            )}

            {/* Voice selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Voice</label>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                style={{
                  ...cardStyle,
                  width: '100%',
                  color: '#f3f4f6',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {voices.length === 0 && <option value={voiceId}>{voiceId || 'Loading voices...'}</option>}
                {voices.map((v) => (
                  <option key={v.voice_id} value={v.voice_id} style={{ backgroundColor: '#111827' }}>
                    {v.name}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                Changes how the agent sounds on voice calls. Click &quot;Save
                Changes&quot; below to apply it.
              </p>
            </div>

            {/* System prompt editor */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Agent instructions (system prompt)</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={18}
                placeholder="Agent instructions..."
                style={{
                  width: '100%',
                  backgroundColor: '#111827',
                  border: '1px solid #1f2937',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: '#f3f4f6',
                  fontFamily: 'monospace',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                This controls how the agent greets customers, what products
                it knows about, and how it answers questions &mdash; on both
                WhatsApp chat and voice calls. Changes only take effect after
                you click &quot;Save Changes&quot;.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                ...buttonPrimary,
                backgroundColor: saving ? '#374151' : '#2563eb',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            {/* Knowledge base */}
            <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #1f2937' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '4px' }}>Knowledge Base</h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px' }}>
                Documents the agent references when answering questions.
                Upload PDF, TXT, DOCX, HTML, EPUB, or Markdown, up to 20MB.
              </p>

              {/* List of currently attached documents */}
              {knowledgeBase.length > 0 && (
                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {knowledgeBase.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        ...cardStyle,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ color: '#d1d5db', fontSize: '14px' }}>{doc.name}</span>
                      <button
                        onClick={() => handleDeleteDocument(doc.id, doc.name)}
                        disabled={deletingId === doc.id}
                        style={{
                          background: 'none',
                          border: '1px solid #7f1d1d',
                          color: deletingId === doc.id ? '#6b7280' : '#f87171',
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          cursor: deletingId === doc.id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {deletingId === doc.id ? 'Removing...' : 'Delete'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label style={{ display: 'inline-block' }}>
                <span style={buttonSecondary}>
                  {uploading ? 'Uploading...' : '+ Upload Document'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.txt,.docx,.html,.epub,.md"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
