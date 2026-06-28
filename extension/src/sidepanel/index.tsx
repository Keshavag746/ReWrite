import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RewriteHistory } from './history/RewriteHistory';
import { Settings } from './settings/Settings';

type Tab = 'history' | 'settings';

const SidePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('history');

  const s = {
    container: {
      width: '100%', minHeight: '100vh', background: '#0F0F10',
      fontFamily: 'Inter, system-ui, sans-serif', color: '#F0F0F2',
      display: 'flex', flexDirection: 'column' as const,
    },
    header: {
      padding: '16px 16px 0', borderBottom: '1px solid #2A2A32',
    },
    title: {
      display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '14px', fontWeight: 700, marginBottom: '12px',
    },
    tabs: {
      display: 'flex', gap: '0',
    },
    tab: (active: boolean) => ({
      flex: 1, padding: '10px', background: 'none', border: 'none',
      borderBottom: `2px solid ${active ? '#7C6EF8' : 'transparent'}`,
      color: active ? '#7C6EF8' : '#8B8B9A',
      cursor: 'pointer', fontSize: '13px', fontWeight: active ? 600 : 400,
      transition: 'all 0.15s',
    }),
    content: {
      flex: 1, padding: '16px', overflowY: 'auto' as const,
    },
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.title}>
          <span>✨</span>
          <span>{chrome.i18n.getMessage('appName')}</span>
        </div>
        <div style={s.tabs}>
          <button style={s.tab(activeTab === 'history')} onClick={() => setActiveTab('history')}>
            {chrome.i18n.getMessage('sidepanelHistoryTab')}
          </button>
          <button style={s.tab(activeTab === 'settings')} onClick={() => setActiveTab('settings')}>
            {chrome.i18n.getMessage('sidepanelSettingsTab')}
          </button>
        </div>
      </div>
      <div style={s.content}>
        {activeTab === 'history' ? <RewriteHistory /> : <Settings />}
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<SidePanel />);
}
