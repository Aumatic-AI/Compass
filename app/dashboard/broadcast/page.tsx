import { loadDashboardConfig } from '@/lib/dashboard-config';
import { getMockBroadcast } from '@/lib/dashboard-data';
import BroadcastPanel from './BroadcastPanel';

export default async function BroadcastPage() {
  const config = loadDashboardConfig();
  const broadcast = getMockBroadcast();

  if (!config.enabledPanels.includes('broadcast')) {
    return (
      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Broadcast</div>
            <div className="panel-sub">Not enabled for this business</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BroadcastPanel
      broadcastLabel={config.broadcastLabel}
      template={broadcast.template}
      segments={broadcast.segments}
      recipientCount={broadcast.recipientCount}
      feePerRecipient={broadcast.feePerRecipient}
    />
  );
}
