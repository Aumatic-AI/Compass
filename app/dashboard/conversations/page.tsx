import { getRealConversations } from '@/lib/dashboard-data';
import ConversationsList from '@/components/ConversationsList';

export default async function ConversationsPage() {
  const conversations = await getRealConversations(50);

  return (
    <div className="panel">
      <ConversationsList conversations={conversations} />
    </div>
  );
}
