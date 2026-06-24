import React, { useState, useEffect } from 'react';

interface SettingsProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ theme, setTheme }) => {
  const [defaultTone, setDefaultTone] = useState('improve');

  useEffect(() => {
    chrome.storage.local.get(['ai_rewrite_default_tone'], (res) => {
      if (res.ai_rewrite_default_tone) {
        setDefaultTone(res.ai_rewrite_default_tone);
      }
    });
  }, []);

  const handleToneSelect = (toneId: string) => {
    setDefaultTone(toneId);
    chrome.storage.local.set({ ai_rewrite_default_tone: toneId });
  };

  const tones = [
    { id: 'improve', label: 'Improve', icon: '✨' },
    { id: 'grammar', label: 'Grammar', icon: '📝' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'friendly', label: 'Friendly', icon: '👋' },
    { id: 'formal', label: 'Formal', icon: '👔' },
    { id: 'casual', label: 'Casual', icon: '😊' },
    { id: 'persuasive', label: 'Persuasive', icon: '🔥' },
    { id: 'confident', label: 'Confident', icon: '💪' },
    { id: 'shorten', label: 'Shorten', icon: '✂️' },
    { id: 'expand', label: 'Expand', icon: '➕' },
    { id: 'simplify', label: 'Simplify', icon: '👶' },
    { id: 'humanize', label: 'Humanize', icon: '👤' },
    { id: 'custom', label: 'Custom', icon: '✏️' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)' }}>Settings</h1>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '24px'
      }}>
        <h2 style={{ fontSize: '16px', margin: '0 0 20px 0', color: 'var(--text-main)' }}>General Configuration</h2>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Interface Theme</label>
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              width: '100%', background: 'var(--icon-bg)', border: '1px solid var(--border)', color: 'var(--text-main)',
              padding: '10px 12px', borderRadius: '8px', fontSize: '14px', outline: 'none'
            }}
          >
            <option>Dark Mode</option>
            <option>Light Mode</option>
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Default Rewrite Tone</label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {tones.map(t => (
              <button
                key={t.id}
                onClick={() => handleToneSelect(t.id)}
                style={{
                  background: defaultTone === t.id ? 'var(--primary-bg)' : 'var(--icon-bg)',
                  border: `1px solid ${defaultTone === t.id ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '8px', padding: '16px 24px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, minWidth: '100px',
                  color: defaultTone === t.id ? 'var(--text-main)' : 'var(--text-muted)', transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '20px' }}>{t.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{t.label}</div>
                {defaultTone === t.id && (
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', marginTop: '4px' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
