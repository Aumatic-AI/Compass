import { loadDashboardConfig } from '@/lib/dashboard-config';
import { getMockOrders } from '@/lib/dashboard-data';

const toneToBadgeClass: Record<string, string> = {
  paid: 'badge paid',
  pending: 'badge pending',
  shipped: 'badge shipped',
  neutral: 'badge neutral',
};

export default async function OrdersPage() {
  const config = loadDashboardConfig();
  const orders = getMockOrders();

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">Live Order Feed</div>
          <div className="panel-sub">Every order, from payment link sent to delivered</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            {config.orderColumns.map((col) => (<th key={col.key}>{col.label}</th>))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.order_id}>
              {config.orderColumns.map((col) => {
                if (col.key === 'order_id') return <td key={col.key}>{order.order_id}</td>;
                if (col.key === 'customer')
                  return (
                    <td key={col.key} className="cust">
                      {order.customer}
                      <span className="cust-phone">{order.phone}</span>
                    </td>
                  );
                if (col.key === 'items') return <td key={col.key}>{order.items}</td>;
                if (col.key === 'tag')
                  return (
                    <td key={col.key}>
                      <span className={toneToBadgeClass[order.tag.tone]}>{order.tag.text}</span>
                    </td>
                  );
                if (col.key === 'amount') return <td key={col.key} className="row-amount">{order.amount}</td>;
                if (col.key === 'payment')
                  return (
                    <td key={col.key}>
                      <span className={toneToBadgeClass[order.payment.tone]}><span className="dot" />{order.payment.text}</span>
                    </td>
                  );
                if (col.key === 'fulfillment')
                  return (
                    <td key={col.key}>
                      <span className={toneToBadgeClass[order.fulfillment.tone]}><span className="dot" />{order.fulfillment.text}</span>
                    </td>
                  );
                if (col.key === 'tracking')
                  return (
                    <td key={col.key}>
                      <input className="track-input" defaultValue={order.tracking} placeholder="—" />
                    </td>
                  );
                return <td key={col.key}>—</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
