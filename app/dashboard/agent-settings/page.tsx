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
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

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
      setLastSavedAt(
        new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' })
      );
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
      await fetchAgentSettings();
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
      const res = await fetch(`/api/agent-settings/knowledge-base?id=${docId}`, { method: 'DELETE' });
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

  const selectedVoiceName = voices.find((v) => v.voice_id === voiceId)?.name || voiceId || '—';

  if (loading) {
    return (
      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">AgentBrain</div>
            <div className="panel-sub">Loading agent settings…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {statusMessage && (
        <div className={`ab-status ${statusType === 'success' ? 'success' : 'error'}`}>{statusMessage}</div>
      )}

      <div className="grid">
        {/* ---------- Main column: behavior, instructions, knowledge base ---------- */}
        <div className="col">
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">{agentName || 'AI Agent'}</div>
                <div className="panel-sub">Agent behavior — greeting and voice, used on both chat and calls</div>
              </div>
            </div>
            <div className="bc-body">
              {firstMessage && (
                <div>
                  <div className="field-label" style={{ marginBottom: 8 }}>
                    First message customers hear
                  </div>
                  <div className="ab-card">{firstMessage}</div>
                </div>
              )}

              <div>
                <div className="field-label" style={{ marginBottom: 8 }}>
                  Voice
                </div>
                <select className="ab-select ab-card" value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
                  {voices.length === 0 && <option value={voiceId}>{voiceId || 'Loading voices...'}</option>}
                  {voices.map((v) => (
                    <option key={v.voice_id} value={v.voice_id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <div className="ab-help">Changes how the agent sounds on voice calls. Save below to apply.</div>
              </div>

              <button className="ab-btn-primary" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Agent Instructions</div>
                <div className="panel-sub">The system prompt — what it knows and how it should answer</div>
              </div>
            </div>
            <div className="bc-body">
              <textarea
                className="ab-textarea ab-card"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={16}
                placeholder="Agent instructions..."
              />
              <div className="ab-help">
                Controls greeting, product knowledge, and how questions get answered — on WhatsApp chat and voice
                calls. Changes take effect only after "Save Changes" above.
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Knowledge Base</div>
                <div className="panel-sub">Documents the agent references when answering — PDF, TXT, DOCX, HTML, EPUB, or Markdown, up to 20MB</div>
              </div>
              <label style={{ display: 'inline-block' }}>
                <span className="ab-btn-secondary">{uploading ? 'Uploading...' : '+ Upload Document'}</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.docx,.html,.epub,.md"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            {knowledgeBase.length > 0 ? (
              <div className="bc-body" style={{ paddingTop: 16 }}>
                {knowledgeBase.map((doc) => (
                  <div key={doc.id} className="ab-kb-doc">
                    <span className="ab-kb-doc-name">{doc.name}</span>
                    <button
                      className="ab-kb-delete"
                      onClick={() => handleDeleteDocument(doc.id, doc.name)}
                      disabled={deletingId === doc.id}
                    >
                      {deletingId === doc.id ? 'Removing...' : 'Delete'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="demo-note">No documents uploaded yet.</div>
            )}
          </div>
        </div>

        {/* ---------- Side column: live summary ---------- */}
        <div className="col">
          <div className="ab-summary-card" style={{ marginTop: 0 }}>
            <div className="ab-summary-head">Agent Summary</div>
            <div className="ab-summary-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="ab-summary-item">
                <div className="ab-summary-item-label">Status</div>
                <div className="ab-summary-item-value">
                  <span className="ab-summary-pill">Active</span>
                </div>
              </div>
              <div className="ab-summary-item">
                <div className="ab-summary-item-label">Voice</div>
                <div className="ab-summary-item-value">{selectedVoiceName}</div>
              </div>
              <div className="ab-summary-item">
                <div className="ab-summary-item-label">Knowledge Base</div>
                <div className="ab-summary-item-value">
                  {knowledgeBase.length} document{knowledgeBase.length === 1 ? '' : 's'}
                </div>
              </div>
              <div className="ab-summary-item">
                <div className="ab-summary-item-label">First Message</div>
                <div className="ab-summary-item-value">{firstMessage ? `${firstMessage.length} chars` : '—'}</div>
              </div>
              <div className="ab-summary-item">
                <div className="ab-summary-item-label">Last Updated</div>
                <div className="ab-summary-item-value">{lastSavedAt || 'Not saved this session'}</div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Quick Tips</div>
              </div>
            </div>
            <div className="bc-body" style={{ gap: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>✓ Use clear steps and rules</div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>✓ Add a product list or knowledge base</div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>✓ Avoid making up information</div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>✓ Keep responses short and helpful</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
