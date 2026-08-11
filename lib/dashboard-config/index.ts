import { DashboardConfig } from './types';
import { suruchiFoodsConfig } from './suruchi-foods';
import { glowPharmaConfig } from './glow-pharma';

// Same idea as loadClientConfig() in your WhatsApp agent code —
// one place decides which client's config is active.
// Later this can read from an env var, a subdomain, or a `clients`
// table in Supabase instead of a hardcoded switch.

const configs: Record<string, DashboardConfig> = {
  'suruchi-foods': suruchiFoodsConfig,
  'glow-pharma': glowPharmaConfig,
};

export function loadDashboardConfig(): DashboardConfig {
  const clientId = process.env.DASHBOARD_CLIENT_ID || 'suruchi-foods';
  const config = configs[clientId];

  if (!config) {
    throw new Error(`No dashboard config found for clientId "${clientId}"`);
  }

  return config;
}
