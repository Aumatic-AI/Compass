import Link from 'next/link';
import { loadDashboardConfig } from '@/lib/dashboard-config';
import { getMockStats, getMockOrders, getRealConversations } from '@/lib/dashboard-data';

const toneToBadgeClass: Record<string, string> = {
  paid: 'badge paid',
  pending: 'badge pending',
  shipped: 'badge shipped',
  neutral: 'badge neutral',
};

export default async function DashboardOverviewPage() {
  const config = loadDashboardConfig();
  const stats = getMockStats();
  const orders = getMockOrders().slice(0, 3);
  const conversations = (await getRealConversations(3));

  const showOrders = config.enabledPanels.includes('order_feed');
  const showConversations = config.enabledPanels.includes('live_conversations');

  return (
    <>
      <div className="stats">
        {config.statCards.map((card) => (
          <div key={card.key} className={`stat${card.soft ? ' soft' : ''}`}>
            <div className="num">{stats[card.key]}</div>
            <div className="label">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid">
        <div className="col">
          {showOrders && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <Link href="/dashboard/orders" className="panel-title-link">
                    <div className="panel-title">Live Order Feed</div>
                  </Link>
                  <div className="panel-sub">Every order, from payment link sent to delivered</div>
                </div>
                <Link href="/dashboard/orders" className="panel-view-all">View all →</Link>
              </div>
              <table>
                <thead>
                  <tr><th>Order</th><th>Customer</th><th>Amount</th><th>Payment</th></tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.order_id}>
                      <td>{order.order_id}</td>
                      <td className="cust">{order.customer}<span className="cust-phone">{order.phone}</span></td>
                      <td className="row-amount">{order.amount}</td>
                      <td><span className={toneToBadgeClass[order.payment.tone]}><span className="dot" />{order.payment.text}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="col">
          {showConversations && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <Link href="/dashboard/conversations" className="panel-title-link">
                    <div className="panel-title">Live Conversations</div>
                  </Link>
                  <div className="panel-sub">Real messages from your Twilio sandbox testing</div>
                </div>
                <Link href="/dashboard/conversations" className="panel-view-all">View all →</Link>
              </div>
              <div className="chat-list">
                {conversations.length === 0 && (
                  <div className="chat-item"><div className="chat-body">No conversations yet.</div></div>
                )}
                {conversations.map((c) => (
                  <div className="chat-item" key={c.phone}>
                    <div className="avatar">{c.initials}</div>
                    <div className="chat-body">
                      <div className="chat-top">
                        <span className="chat-name">{c.name}</span>
                        <span className="chat-time">{c.time}</span>
                      </div>
                      <div className="chat-preview">&ldquo;{c.preview}&rdquo;</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
