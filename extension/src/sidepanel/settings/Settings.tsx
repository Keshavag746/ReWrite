import React, { useState, useEffect } from 'react';
import { User, UsageInfo, ChromeMessage } from '../../shared/types/index';
import { BACKEND_URL } from '../../shared/utils/api';

export const Settings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const result = await chrome.storage.local.get(['ai_rewrite_jwt', 'ai_rewrite_user']);
    const storedUser = result['ai_rewrite_user'] as User | undefined;
    const jwt = result['ai_rewrite_jwt'] as string | undefined;
    if (!storedUser) return;

    setUser(storedUser);

    if (jwt) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/usage`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (res.ok) setUsage(await res.json() as UsageInfo);
      } catch { /* ignore */ }
    }
  }

  async function handleLogout() {
    const msg: ChromeMessage = { type: 'AUTH_LOGOUT' };
    chrome.runtime.sendMessage(msg, () => {
      setUser(null);
      setUsage(null);
    });
  }

  const s = {
    section: {
      background: '#1A1A1E', border: '1px solid #2A2A32', borderRadius: '10px',
      padding: '16px', marginBottom: '12px',
    },
    sectionTitle: {
      fontSize: '11px', color: '#8B8B9A', textTransform: 'uppercase' as const,
      letterSpacing: '0.08em', marginBottom: '12px', fontWeight: 600,
    },
    label: { fontSize: '13px', color: '#F0F0F2', fontWeight: 500 },
    sublabel: { fontSize: '12px', color: '#8B8B9A', marginTop: '2px' },
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center' as const, color: '#8B8B9A', padding: '40px 20px' }}>
        {chrome.i18n.getMessage('loginRequiredSettings')}
      </div>
    );
  }

  const usagePercent = usage && usage.limit > 0 ? (usage.count / usage.limit) * 100 : 0;

  return (
    <div>
      {/* Account */}
      <div style={s.section}>
        <div style={s.sectionTitle}>{chrome.i18n.getMessage('sidepanelAccount')}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={s.label}>{user.name}</div>
            <div style={s.sublabel}>{user.email}</div>
          </div>
          <span style={{
            padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
            background: user.plan !== 'free' ? 'rgba(124,110,248,0.15)' : '#2A2A32',
            color: user.plan !== 'free' ? '#7C6EF8' : '#8B8B9A',
            border: `1px solid ${user.plan !== 'free' ? '#7C6EF8' : '#3A3A45'}`,
          }}>
            {user.plan === 'free' 
              ? chrome.i18n.getMessage('planFree') 
              : (user.plan === 'pro' ? (chrome.i18n.getMessage('planPro') || 'Pro') : (user.plan.charAt(0).toUpperCase() + user.plan.slice(1)))}
          </span>
        </div>
      </div>

      {/* Usage */}
      {usage && (
        <div style={s.section}>
          <div style={s.sectionTitle}>{chrome.i18n.getMessage('dailyUsage')}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={s.sublabel}>{chrome.i18n.getMessage('sidepanelRewritesToday')}</span>
            <span style={{ fontSize: '13px', color: '#F0F0F2', fontWeight: 500 }}>
              {usage.count}{usage.limit > 0 ? ` / ${usage.limit}` : ` ${chrome.i18n.getMessage('unlimited')}`}
            </span>
          </div>
          {usage.limit > 0 && (
            <>
              <div style={{ background: '#0F0F10', borderRadius: '999px', height: '6px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{
                  width: `${Math.min(100, usagePercent)}%`, height: '100%',
                  background: usagePercent >= 90 ? '#f87171' : '#7C6EF8',
                  borderRadius: '999px',
                }} />
              </div>
              <div style={s.sublabel}>
                {chrome.i18n.getMessage('sidepanelResets')}{new Date(usage.resetAt).toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </>
          )}
        </div>
      )}

      {/* AI Engine */}
      <div style={s.section}>
        <div style={s.sectionTitle}>{chrome.i18n.getMessage('sidepanelEngineTitle')}</div>
        <div style={{
          padding: '10px 14px', borderRadius: '8px',
          border: '1px solid #7C6EF8', background: 'rgba(124,110,248,0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '13px', color: '#F0F0F2' }}>{chrome.i18n.getMessage('sidepanelEngineLabel')}</span>
          <span style={{ color: '#7C6EF8', fontSize: '14px', fontWeight: 600 }}>{chrome.i18n.getMessage('sidepanelEngineActive')}</span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%', padding: '10px', background: '#2A2A32',
          border: '1px solid #3A3A45', borderRadius: '8px',
          color: '#f87171', cursor: 'pointer', fontWeight: 500, fontSize: '13px',
        }}
      >
        {chrome.i18n.getMessage('btnSignOut')}
      </button>
    </div>
  );
};
