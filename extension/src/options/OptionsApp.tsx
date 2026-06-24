import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AccountUsage } from './pages/AccountUsage';
import { Settings } from './pages/Settings';
import { HelpFAQ } from './pages/HelpFAQ';
import { DownloadHistory } from './pages/DownloadHistory';
import { RewriteHistoryPage } from './pages/RewriteHistoryPage';

export const OptionsApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [theme, setTheme] = useState('Dark Mode');

  useEffect(() => {
    chrome.storage.local.get(['ai_rewrite_dashboard_theme'], (res) => {
      if (res.ai_rewrite_dashboard_theme) {
        setTheme(res.ai_rewrite_dashboard_theme);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ ai_rewrite_dashboard_theme: theme });
  }, [theme]);

  const isDark = theme !== 'Light Mode';

  const themeVars = isDark ? `
    :root {
      --bg-main: #0d1117;
      --bg-sidebar: #161b22;
      --bg-card: #161b22;
      --border: #30363d;
      --text-main: #F0F0F2;
      --text-muted: #8b949e;
      --primary: #7C6EF8;
      --primary-bg: rgba(124, 110, 248, 0.1);
      --icon-bg: #0d1117;
    }
  ` : `
    :root {
      --bg-main: #f9fafb;
      --bg-sidebar: #ffffff;
      --bg-card: #ffffff;
      --border: #e5e7eb;
      --text-main: #111827;
      --text-muted: #6b7280;
      --primary: #7C6EF8;
      --primary-bg: rgba(124, 110, 248, 0.1);
      --icon-bg: #f3f4f6;
    }
  `;

  const renderContent = () => {
    switch (activeTab) {
      case 'account': return <AccountUsage />;
      case 'settings': return <Settings theme={theme} setTheme={setTheme} />;
      case 'help': return <HelpFAQ />;
      case 'download': return <DownloadHistory />;
      case 'history': return <RewriteHistoryPage />;
      default: return (
        <div style={{ color: 'var(--text-muted)', marginTop: '20px' }}>
          This section is currently under construction.
        </div>
      );
    }
  };

  return (
    <>
      <style>{themeVars}</style>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          {renderContent()}
        </main>
      </div>
    </>
  );
};
