'use client';

import { useState } from 'react';
import type { CallRecord } from '@/lib/dashboard-data';

const statusStyles: Record<CallRecord['status'], { text: string; color: string; bg: string }> = {
  completed: { text: 'Completed', color: '#4ade80', bg: '#052e16' },
  missed: { text: 'Missed', color: '#facc15', bg: '#422006' },
  failed: { text: 'Failed', color: '#f87171', bg: '#450a0a' },
  in_progress: { text: 'In progress', color: '#60a5fa', bg: '#1e3a5f' },
};

export default function CallRecordingRow({
  call,
  onDeleted,
}: {
  call: CallRecord;
  onDeleted?: (id: string) => void;
}) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const badge = statusStyles[call.status];

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete this call permanently? This removes the recording and transcript from ElevenLabs — this can't be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/calls/${call.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      onDeleted?.(call.id);
    } catch (err: any) {
      alert(err.message || 'Could not delete this call.');
      setDeleting(false);
    }
  }

  return (
    <div className="call-item">
      <div className="call-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="call-name">{call.name}</div>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '999px',
              color: badge.color,
              backgroundColor: badge.bg,
            }}
          >
            {badge.text}
          </span>
        </div>
        <div className="call-meta">
          {call.phone} · {call.timeAgo} · {call.duration}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {call.hasAudio ? (
          <button
            onClick={() => setShowPlayer((v) => !v)}
            style={{
              backgroundColor: showPlayer ? '#1e3a8a' : 'transparent',
              border: '1px solid #3b82f6',
              color: '#93c5fd',
              fontSize: '13px',
              fontWeight: 500,
              padding: '7px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {showPlayer ? 'Hide Recording' : 'View Recording'}
          </button>
        ) : (
          <span
            style={{
              fontSize: '13px',
              color: '#6b7280',
              padding: '7px 14px',
              border: '1px solid #374151',
              borderRadius: '6px',
            }}
          >
            No recording
          </span>
        )}

        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #7f1d1d',
            color: deleting ? '#6b7280' : '#f87171',
            fontSize: '13px',
            fontWeight: 500,
            padding: '7px 14px',
            borderRadius: '6px',
            cursor: deleting ? 'not-allowed' : 'pointer',
          }}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      {showPlayer && call.hasAudio && (
        <div className="audio-player-wrap" style={{ width: '100%', marginTop: '8px' }}>
          <audio controls src={`/api/calls/${call.id}/audio`} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}