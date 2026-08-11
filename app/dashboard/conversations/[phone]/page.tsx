import Link from 'next/link';
import { getConversationThread } from '@/lib/dashboard-data';

export default async function ChatThreadPage({ params }: { params: { phone: string } }) {
  const thread = await getConversationThread(params.phone);

  return (
    <div className="panel">
      <div className="thread-header">
        <div>
          <div className="panel-title">{thread.name}</div>
          <div className="panel-sub">{thread.phone}</div>
        </div>
        <Link href="/dashboard/conversations" className="thread-back">← Back to Conversations</Link>
      </div>
      <div className="thread-list">
        {thread.messages.length === 0 && (
          <div className="thread-msg assistant">No messages found for this number.</div>
        )}
        {thread.messages.map((m, i) => (
          <div key={i} className={`thread-msg ${m.role}`}>
            {m.message}
            <span className="thread-time">{m.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}