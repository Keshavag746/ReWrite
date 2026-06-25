import React, { useState, useEffect } from 'react';
import { User, UsageInfo, ChromeMessage } from '../../shared/types/index';

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#7C6EF8" strokeLinejoin="round"/>
    <path d="M19 3L19.8 5.2L22 6L19.8 6.8L19 9L18.2 6.8L16 6L18.2 5.2L19 3Z" fill="#7C6EF8" opacity="0.7"/>
  </svg>
);

export const PopupMain: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  const BACKEND_URL = 'https://rewrite-8jxg.onrender.com';

  useEffect(() => {
    loadUserData();

    // Get the window ID of the active tab on mount to preserve user gesture on open
    chrome.tabs.query({ active: true, currentWindow: true }, () => {
      // Preserves user gesture
    });
  }, []);

  async function loadUserData() {
    setLoading(true);
    try {
      // Get user from storage
      const result = await chrome.storage.local.get(['ai_rewrite_jwt', 'ai_rewrite_user']);
      const storedUser = result['ai_rewrite_user'] as User | undefined;
      const jwt = result['ai_rewrite_jwt'] as string | undefined;

      if (!storedUser || !jwt) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(storedUser);

      // Fetch fresh usage data
      const res = await fetch(`${BACKEND_URL}/api/usage`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const data = await res.json() as UsageInfo;
        setUsage(data);
      }
    } catch {
      // Ignore network errors in popup
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setAuthLoading(true);
    setError('');
    try {
      const msg: ChromeMessage = { type: 'AUTH_LOGIN' };
      const response = await new Promise<{ user: User; token: string } & { error?: string }>(
        (resolve, reject) =>
          chrome.runtime.sendMessage(msg, (res) => {
            if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
            resolve(res);
          })
      );
      if (response.error) throw new Error(response.error);
      setUser(response.user);
      await loadUserData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    const msg: ChromeMessage = { type: 'AUTH_LOGOUT' };
    chrome.runtime.sendMessage(msg, () => {
      setUser(null);
      setUsage(null);
    });
  }

  function openOptions() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('src/options/index.html'));
    }
  }

  const s = {
    container: {
      width: '320px', minHeight: '300px', background: '#0F0F10',
      fontFamily: 'Inter, system-ui, sans-serif', color: '#F0F0F2',
      padding: '20px',
    },
    header: {
      display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
    },
    title: { fontSize: '16px', fontWeight: 700, color: '#F0F0F2' },
    card: {
      background: '#1A1A1E', border: '1px solid #2A2A32', borderRadius: '10px',
      padding: '16px', marginBottom: '12px',
    },
    label: { fontSize: '11px', color: '#8B8B9A', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '4px' },
    value: { fontSize: '14px', color: '#F0F0F2', fontWeight: 500 },
    btn: {
      width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
      cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.15s',
    },
    primaryBtn: {
      background: '#7C6EF8', color: 'white',
      boxShadow: '0 4px 16px rgba(124,110,248,0.3)',
    },
    secondaryBtn: {
      background: '#2A2A32', color: '#F0F0F2', border: '1px solid #3A3A45',
    },
  };

  if (loading) {
    return (
      <div style={s.container}>
        <div style={s.header}>
          <SparkleIcon />
          <span style={s.title}>AI Rewrite Anywhere</span>
        </div>
        <div style={{ color: '#8B8B9A', textAlign: 'center' as const, marginTop: '40px' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={s.container}>
        <div style={s.header}>
          <SparkleIcon />
          <span style={s.title}>AI Rewrite Anywhere</span>
        </div>
        <div style={{ ...s.card, textAlign: 'center' as const }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✨</div>
          <div style={{ ...s.value, marginBottom: '6px' }}>Rewrite text anywhere</div>
          <div style={{ color: '#8B8B9A', fontSize: '13px', marginBottom: '20px' }}>
            Sign in with Google to start rewriting text on any website with AI.
          </div>
          {error && <div style={{ color: '#f87171', fontSize: '12px', marginBottom: '12px' }}>{error}</div>}
          <button
            onClick={handleLogin}
            disabled={authLoading}
            style={{ ...s.btn, ...s.primaryBtn }}
          >
            {authLoading ? 'Signing in...' : '🔐 Sign in with Google'}
          </button>
        </div>
      </div>
    );
  }

  const usagePercent = usage && usage.limit > 0 ? (usage.count / usage.limit) * 100 : 0;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <SparkleIcon />
        <span style={s.title}>AI Rewrite Anywhere</span>
      </div>

      {/* User info */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={s.value}>{user.name}</div>
            <div style={{ ...s.label, marginTop: '2px' }}>{user.email}</div>
          </div>
          <span style={{
            padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
            background: user.plan === 'pro' ? 'rgba(124,110,248,0.2)' : '#2A2A32',
            color: user.plan === 'pro' ? '#7C6EF8' : '#8B8B9A',
            border: `1px solid ${user.plan === 'pro' ? '#7C6EF8' : '#3A3A45'}`,
          }}>
            {user.plan === 'pro' ? '⚡ Pro' : 'Free'}
          </span>
        </div>
      </div>

      {/* Usage */}
      {usage && (
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={s.label}>Daily Usage</span>
            <span style={{ fontSize: '13px', color: '#F0F0F2' }}>
              {usage.count}{usage.limit > 0 ? ` / ${usage.limit}` : ' (unlimited)'}
            </span>
          </div>
          {usage.limit > 0 && (
            <div style={{ background: '#0F0F10', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, usagePercent)}%`, height: '100%',
                background: usagePercent >= 90 ? '#f87171' : '#7C6EF8',
                borderRadius: '999px', transition: 'width 0.3s ease',
              }} />
            </div>
          )}
        </div>
      )}

      {/* Quick tip */}
      <div style={{ ...s.card, background: 'rgba(124,110,248,0.08)', border: '1px solid rgba(124,110,248,0.2)' }}>
        <div style={{ fontSize: '12px', color: '#A89EFA' }}>
          💡 Select text on any page → click the ✨ button to rewrite. Or press <kbd style={{ background: '#2A2A32', padding: '1px 5px', borderRadius: '3px' }}>Ctrl+Shift+K</kbd>
        </div>
      </div>

      {/* Buttons */}
      <button onClick={openOptions} style={{ ...s.btn, ...s.primaryBtn, marginBottom: '8px' }}>
        📋 Open History & Settings
      </button>
      <button onClick={handleLogout} style={{ ...s.btn, ...s.secondaryBtn }}>
        Sign Out
      </button>
    </div>
  );
};
