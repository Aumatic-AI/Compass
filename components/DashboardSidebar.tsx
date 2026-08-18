'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export default function DashboardSidebar({
  enabledPanels,
  brandName,
}: {
  enabledPanels: string[];
  brandName: string;
}) {
  const pathname = usePathname();
  const shortName = brandName.split(' ')[0];
  const initial = shortName.charAt(0).toUpperCase();

  const items: NavItem[] = [
    { href: '/dashboard', label: 'Overview', icon: '◆' },
  ];
  if (enabledPanels.includes('order_feed')) items.push({ href: '/dashboard/orders', label: 'Orders', icon: '▤' });
  if (enabledPanels.includes('live_conversations')) items.push({ href: '/dashboard/conversations', label: 'Conversations', icon: '◐' });
  if (enabledPanels.includes('catalog')) items.push({ href: '/dashboard/catalog', label: 'Catalog', icon: '▦' });
  if (enabledPanels.includes('calls')) items.push({ href: '/dashboard/calls', label: 'Calls', icon: '☎' });
  if (enabledPanels.includes('broadcast')) items.push({ href: '/dashboard/broadcast', label: 'Broadcast', icon: '▲' });

  // Agent Settings is always shown — it's not tied to a client config
  // panel toggle since every client with an AI agent needs it.
  items.push({ href: '/dashboard/agent-settings', label: 'AgentBrain', icon: '⚙' });

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  }

  // No manual collapse toggle — the sidebar is icon-only by default and
  // expands automatically on hover (pure CSS, see .dash-sidebar:hover
  // in dashboard-theme.css). Labels always render in the DOM so the
  // hover expansion is instant with no layout jump.
  return (
    <div className="dash-sidebar auto-collapse">
      <div className="sidebar-logo-row">
        <div className="sidebar-logo-mark">{initial}</div>
        <div className="sidebar-logo-name">{shortName}</div>
      </div>

      <nav className="side-nav">
        {items.map((item) => {
          const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`side-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="side-nav-icon-tile">{item.icon}</span>
              <span className="side-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button type="button" onClick={handleLogout} className="side-nav-item side-nav-logout">
        <span className="side-nav-icon-tile">⎋</span>
        <span className="side-nav-label">Logout</span>
      </button>
    </div>
  );
}