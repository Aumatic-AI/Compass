'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConversationPreview } from '@/lib/dashboard-data';

export default function ConversationsList({ conversations }: { conversations: ConversationPreview[] }) {
  const [query, setQuery] = useState('');

  const filtered = conversations.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
  });

  return (
    <>
      <div className="panel-head">
        <div>
          <div className="panel-title">Live Conversations</div>
          <div className="panel-sub">Real messages from your Twilio sandbox testing</div>
        </div>
        <input
          className="search-input-inline"
          type="text"
          placeholder="Search name or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="chat-list">
        {filtered.length === 0 && (
          <div className="search-empty">
            {conversations.length === 0
              ? 'No conversations yet — send a WhatsApp message to your sandbox number to see it here.'
              : `No results for "${query}".`}
          </div>
        )}
        {filtered.map((c) => (
          <div className="chat-item" key={c.phone}>
            <div className="avatar">{c.initials}</div>
            <div className="chat-body">
              <div className="chat-top">
                <span className="chat-name">
                  {c.name}
                  <span className="chat-phone">{c.phone}</span>
                </span>
                <span className="chat-time">{c.time}</span>
              </div>
              <div className="chat-preview">&ldquo;{c.preview}&rdquo;</div>
              <div className="chat-flags">
                {c.flag === 'wait' && <span className="flag wait">Needs reply</span>}
                {c.flag === 'ai' && <span className="flag ai">AI active</span>}
              </div>
            </div>
            <div className="chat-actions">
              <Link href={`/dashboard/conversations/${encodeURIComponent(c.phone)}`} className="btn-pill">
                View Chat
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
