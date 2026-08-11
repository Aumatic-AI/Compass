import fs from 'fs';
import path from 'path';

// Reads the one config.json file for whichever client this deployment
// is running (set via the CLIENT_ID environment variable). Nothing in
// lib/core/ ever hardcodes a business name — it all comes from here.

export function loadClientConfig(clientId?: string) {
  const id = clientId || process.env.CLIENT_ID || 'suruchi-foods';
  const configPath = path.join(process.cwd(), 'lib', 'clients', id, 'config.json');
  const raw = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(raw);
}
