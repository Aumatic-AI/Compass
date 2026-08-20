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
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-card">
        <div className="login-badge">C</div>

        <h1 className="login-title">Compass Dashboard</h1>
        <p className="login-subtitle">Sign in to manage your WhatsApp business.</p>

        {error && <div className="login-error">{error}</div>}

        <div className="login-field">
          <label className="login-label" htmlFor="username">
            User ID
          </label>
          <input
            id="username"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your user ID"
            autoFocus
          />
        </div>

        <div className="login-field">
          <label className="login-label" htmlFor="password">
            Password
          </label>
          <div className="login-password-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="login-input login-input-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="login-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button type="submit" className="login-submit" disabled={loading || !username || !password}>
          {loading ? 'Signing in…' : 'Log In'}
        </button>
      </form>

      <style jsx global>{`
        html,
        body {
          margin: 0;
          height: 100%;
          overflow: hidden;
        }
      `}</style>

      <style jsx>{`
        .login-page {
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #ffffff;
        }

        .login-card {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 40px 36px;
          width: 100%;
          max-width: 380px;
          box-sizing: border-box;
        }

        .login-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(160deg, #25d366, #128c7e);
          color: #fff;
          font-weight: 700;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .login-title {
          font-size: 22px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 4px;
          letter-spacing: -0.01em;
        }

        .login-subtitle {
          font-size: 13.5px;
          color: #6b7280;
          margin: 0 0 24px;
        }

        .login-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 13px;
          line-height: 1.5;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .login-field {
          margin-bottom: 18px;
        }

        .login-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .login-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 8px;
          border: 1.5px solid #e5e7eb;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .login-input:focus {
          border-color: #25d366;
          box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.15);
        }

        .login-password-wrap {
          position: relative;
        }

        .login-input-password {
          padding-right: 52px;
        }

        .login-toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          color: #128c7e;
          padding: 6px 8px;
          border-radius: 6px;
          transition: background 0.15s ease;
        }

        .login-toggle:hover {
          background: rgba(18, 140, 126, 0.08);
        }

        .login-submit {
          width: 100%;
          padding: 13px;
          border-radius: 8px;
          border: none;
          background: #25d366;
          color: #fff;
          font-weight: 700;
          font-size: 14.5px;
          cursor: pointer;
          margin-top: 4px;
          transition: background 0.15s ease, opacity 0.15s ease;
        }

        .login-submit:hover:not(:disabled) {
          background: #1fb857;
        }

        .login-submit:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
