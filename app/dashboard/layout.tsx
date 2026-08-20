import './dashboard.css';
import './sidebar.css';
import './dashboard-theme.css';
import { loadDashboardConfig } from '@/lib/dashboard-config';
import DashboardSidebar from '@/components/DashboardSidebar';
import { getConnectedWhatsAppNumber } from '@/lib/whatsapp-number';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const config = loadDashboardConfig();
  const whatsappNumber = await getConnectedWhatsAppNumber();

  return (
    <div
      className="dash-page-bg"
      style={
        {
          '--maroon': config.theme.primary,
          '--maroon-dark': config.theme.primaryDark,
          '--saffron': config.theme.accent,
        } as React.CSSProperties
      }
    >
      <DashboardSidebar enabledPanels={config.enabledPanels} brandName={config.brandName} />

      <div className="dash-main">
        <div className="topbar">
          <div className="brand">
            <div className="brand-eyebrow">{config.brandEyebrow}</div>
            <div className="brand-name">{config.brandName}</div>
          </div>
          <div className="topbar-meta">
            <div>
              <span className="live-dot" />
              <strong>Live</strong> —{' '}
              {new Date().toLocaleString('en-IN', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </div>
            <div>WhatsApp: {whatsappNumber} · Connected</div>
          </div>
        </div>

        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}
