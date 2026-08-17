'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed.');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const dest = params.get('from') || '/dashboard';
      router.push(dest);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f6f5',
        fontFamily: 'Inter, -apple-system, sans-serif',
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          padding: '40px 36px',
          width: '100%',
          maxWidth: 380,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(160deg, #25d366, #128c7e)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          C
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1f2937', margin: '0 0 4px' }}>
          Compass Dashboard
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 28px' }}>
          Sign in to manage your WhatsApp business.
        </p>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: 13,
              padding: '10px 14px',
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
          User ID
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your user ID"
          autoFocus
          style={{
            width: '100%',
            padding: '11px 14px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            fontSize: 14,
            marginBottom: 16,
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />

        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
          Password
        </label>
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{
              width: '100%',
              padding: '11px 44px 11px 14px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 14,
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              color: '#128c7e',
              padding: '4px 6px',
            }}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !username || !password}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 9,
            border: 'none',
            background: loading || !username || !password ? '#d1d5db' : '#25d366',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Signing in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}
