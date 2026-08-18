'use client';

import { useState, useEffect } from 'react';

type Tab = 'general' | 'whatsapp' | 'automation';

type ClientAccount = {
  id?: string;
  business_name: string;
  whatsapp_access_token: string;
  whatsapp_phone_number_id: string;
  whatsapp_waba_id: string;
  connection_status: 'connected' | 'disconnected';
};

const EMPTY_ACCOUNT: ClientAccount = {
  business_name: '',
  whatsapp_access_token: '',
  whatsapp_phone_number_id: '',
  whatsapp_waba_id: '',
  connection_status: 'disconnected',
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [account, setAccount] = useState<ClientAccount>(EMPTY_ACCOUNT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings/whatsapp')
      .then((res) => res.json())
      .then((data) => {
        if (data.account) setAccount(data.account);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch('/api/settings/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMessage('Saved successfully.');
        setAccount((prev) => ({ ...prev, id: data.account?.id ?? prev.id }));
      } else {
        setSaveMessage(data.error || 'Save failed.');
      }
    } catch (err) {
      setSaveMessage('Save failed — check your connection.');
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    setTestResult('idle');
    setTestMessage('');
    try {
      const res = await fetch('/api/settings/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp_access_token: account.whatsapp_access_token,
          whatsapp_phone_number_id: account.whatsapp_phone_number_id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult('success');
        setTestMessage(data.message || 'Connection verified.');
        setAccount((prev) => ({ ...prev, connection_status: 'connected' }));
      } else {
        setTestResult('error');
        setTestMessage(data.error || 'Could not verify connection.');
      }
    } catch (err) {
      setTestResult('error');
      setTestMessage('Network error while testing connection.');
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="dash-content">
        <p className="footnote">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="dash-content" style={{ maxWidth: 880 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--wa-green-dark)' }}>
          COMPASS · BUSINESS CONTROL CENTER
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', margin: '4px 0 0' }}>
          Settings
        </h1>
        <p className="footnote" style={{ marginTop: 4 }}>
          Manage your business profile and WhatsApp connection.
        </p>
      </div>

      {/* Tab pills */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--line)', paddingBottom: 0 }}>
        {[
          { id: 'general' as Tab, label: 'General' },
          { id: 'whatsapp' as Tab, label: 'WhatsApp Connection' },
          { id: 'automation' as Tab, label: 'Automation Defaults' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === tab.id ? 'var(--wa-green-tint)' : 'transparent',
              color: activeTab === tab.id ? 'var(--wa-green-dark)' : 'var(--ink-soft)',
              borderBottom: activeTab === tab.id ? '2px solid var(--wa-green)' : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Business Identity</h3>
          <p className="footnote" style={{ margin: '4px 0 20px' }}>
            Core facts about the business — used for greetings and internal reference.
          </p>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
            BUSINESS NAME
          </label>
          <input
            type="text"
            value={account.business_name}
            onChange={(e) => setAccount({ ...account, business_name: e.target.value })}
            placeholder="e.g. Suruchi Foods"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--line)',
              fontSize: 14,
              color: 'var(--ink)',
              marginBottom: 20,
            }}
          />
        </div>
      )}

      {/* WHATSAPP CONNECTION TAB */}
      {activeTab === 'whatsapp' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                WhatsApp Business Credentials
              </h3>
              <p className="footnote" style={{ margin: '4px 0 20px' }}>
                Connect your own WhatsApp Business Account to power replies through this dashboard.
              </p>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 999,
                background: account.connection_status === 'connected' ? 'var(--paid-bg)' : 'var(--pending-bg)',
                color: account.connection_status === 'connected' ? 'var(--green)' : 'var(--red)',
              }}
            >
              {account.connection_status === 'connected' ? '● Connected' : '● Disconnected'}
            </span>
          </div>

          {[
            { key: 'whatsapp_access_token' as const, label: 'ACCESS TOKEN', type: 'password' },
            { key: 'whatsapp_phone_number_id' as const, label: 'PHONE NUMBER ID', type: 'text' },
            { key: 'whatsapp_waba_id' as const, label: 'WABA ID', type: 'text' },
          ].map((field) => (
            <div key={field.key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                {field.label}
              </label>
              <input
                type={field.type}
                value={account[field.key]}
                onChange={(e) => setAccount({ ...account, [field.key]: e.target.value })}
                placeholder={field.label === 'ACCESS TOKEN' ? 'Paste your Meta access token' : 'Paste the ID from Meta dashboard'}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--line)',
                  fontSize: 14,
                  color: 'var(--ink)',
                }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center' }}>
            <button
              onClick={handleTestConnection}
              disabled={testing || !account.whatsapp_access_token || !account.whatsapp_phone_number_id}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: '1px solid var(--line)',
                background: '#fff',
                color: 'var(--ink)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                opacity: testing ? 0.6 : 1,
              }}
            >
              {testing ? 'Testing…' : 'Test Connection'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--wa-green)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            {testMessage && (
              <span style={{ fontSize: 13, color: testResult === 'success' ? 'var(--green)' : 'var(--red)' }}>
                {testMessage}
              </span>
            )}
            {saveMessage && !testMessage && (
              <span className="footnote">{saveMessage}</span>
            )}
          </div>
        </div>
      )}

      {/* AUTOMATION DEFAULTS TAB — placeholder for future work */}
      {activeTab === 'automation' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Automation Defaults</h3>
          <p className="footnote" style={{ margin: '4px 0 0' }}>
            Coming soon — default greeting behavior, business hours, and auto-reply rules.
          </p>
        </div>
      )}
    </div>
  );
}
