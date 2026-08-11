'use client';

import { useEffect, useState } from 'react';
import CallRecordingRow from '@/components/CallRecordingRow';
import type { CallRecord } from '@/lib/dashboard-data';

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalls();
  }, []);

  async function fetchCalls() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/calls');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load calls');
      setCalls(data.calls || []);
    } catch (err: any) {
      setError(err.message || 'Could not load calls.');
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toDateString();
  const callsToday = calls.filter((c) => new Date(c.startedAt).toDateString() === today);
  const missedCount = calls.filter((c) => c.status === 'missed' || c.status === 'failed').length;
  const avgDuration =
    calls.length > 0
      ? Math.round(calls.reduce((sum, c) => sum + c.durationSecs, 0) / calls.length)
      : 0;

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">Recent Calls</div>
          <div className="panel-sub">WhatsApp voice calls handled by the AI agent</div>
        </div>
        <button
          onClick={fetchCalls}
          disabled={loading}
          style={{
            background: 'none',
            border: '1px solid #374151',
            color: '#9ca3af',
            fontSize: '13px',
            padding: '6px 14px',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Stats strip */}
      {!loading && !error && (
        <div style={{ display: 'flex', gap: '12px', padding: '16px 0', flexWrap: 'wrap' }}>
          <StatBox label="Calls today" value={String(callsToday.length)} />
          <StatBox label="Total calls" value={String(calls.length)} />
          <StatBox label="Avg. duration" value={avgDuration ? `${Math.floor(avgDuration / 60)}:${(avgDuration % 60).toString().padStart(2, '0')}` : '—'} />
          <StatBox label="Missed / failed" value={String(missedCount)} />
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: '56px',
                borderRadius: '8px',
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: '#450a0a',
            color: '#f87171',
            border: '1px solid #991b1b',
            fontSize: '14px',
            marginBottom: '16px',
          }}
        >
          {error}{' '}
          <button
            onClick={fetchCalls}
            style={{ marginLeft: '8px', color: '#fca5a5', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && calls.length === 0 && (
        <div className="demo-note">No calls yet. Once a customer calls your WhatsApp voice number, it'll show up here.</div>
      )}

      {!loading && !error && calls.length > 0 && (
        <div>
          {calls.map((call) => (
            <CallRecordingRow
              key={call.id}
              call={call}
              onDeleted={(id) => setCalls((prev) => prev.filter((c) => c.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '8px',
        padding: '10px 16px',
        minWidth: '110px',
      }}
    >
      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        {label}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 600, color: '#f3f4f6', marginTop: '2px' }}>{value}</div>
    </div>
  );
}