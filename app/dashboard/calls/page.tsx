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
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            color: '#1f2937',
            fontSize: '13px',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Stats strip — same green-gradient card style as the Overview page */}
      {!loading && !error && (
        <div style={{ display: 'flex', gap: '12px', padding: '16px 20px', flexWrap: 'wrap' }}>
          <StatBox label="Calls today" value={String(callsToday.length)} />
          <StatBox label="Total calls" value={String(calls.length)} />
          <StatBox
            label="Avg. duration"
            value={avgDuration ? `${Math.floor(avgDuration / 60)}:${(avgDuration % 60).toString().padStart(2, '0')}` : '—'}
          />
          <StatBox label="Missed / failed" value={String(missedCount)} />
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 20px' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: '56px',
                borderRadius: '8px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #e5e7eb',
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
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            fontSize: '14px',
            margin: '0 20px 16px',
          }}
        >
          {error}{' '}
          <button
            onClick={fetchCalls}
            style={{ marginLeft: '8px', color: '#b91c1c', textDecoration: 'underline', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
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
        background: 'linear-gradient(155deg, #25d366, #128c7e)',
        borderRadius: '14px',
        padding: '14px 20px',
        minWidth: '130px',
        boxShadow: '0 4px 14px rgba(18, 140, 126, 0.18)',
      }}
    >
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>{value}</div>
    </div>
  );
}