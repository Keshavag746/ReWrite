import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AccountUsage } from './pages/AccountUsage';
import { Settings } from './pages/Settings';
import { HelpFAQ } from './pages/HelpFAQ';
import { DownloadHistory } from './pages/DownloadHistory';
import { RewriteHistoryPage } from './pages/RewriteHistoryPage';
import { User, UsageInfo } from '../shared/types/index';

export const OptionsApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [theme, setTheme] = useState('Dark Mode');
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  const loadData = async () => {
    try {
      const result = await chrome.storage.local.get(['ai_rewrite_user', 'ai_rewrite_jwt']);
      const storedUser = result['ai_rewrite_user'] as User | undefined;
      const jwt = result['ai_rewrite_jwt'] as string | undefined;
      
      if (storedUser) {
        setUser(storedUser);
      } else {
        setUser(null);
      }

      if (jwt) {
        const res = await fetch('http://140.245.6.232:3001/api/usage', {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (res.ok) {
          setUsage(await res.json() as UsageInfo);
        }
      } else {
        setUsage(null);
      }
    } catch (err) {
      console.error('[OptionsApp] Failed to load user data:', err);
    }
  };

  useEffect(() => {
    chrome.storage.local.get(['ai_rewrite_dashboard_theme'], (res) => {
      if (res.ai_rewrite_dashboard_theme) {
        setTheme(res.ai_rewrite_dashboard_theme);
      }
    });

    loadData();

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes['ai_rewrite_user'] || changes['ai_rewrite_jwt']) {
        loadData();
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ ai_rewrite_dashboard_theme: theme });
  }, [theme]);

  const handleLogin = async () => {
    try {
      const response = await new Promise<any>((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'AUTH_LOGIN' }, (res) => {
          if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
          resolve(res);
        });
      });
      if (response.error) throw new Error(response.error);
      await loadData();
    } catch (err) {
      console.warn('[OptionsApp] Login failed:', err);
      alert(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleLogout = async () => {
    chrome.runtime.sendMessage({ type: 'AUTH_LOGOUT' }, () => {
      setUser(null);
      setUsage(null);
    });
  };

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
      case 'account': return <AccountUsage user={user} usage={usage} onLogin={handleLogin} onLogout={handleLogout} />;
      case 'settings': return <Settings theme={theme} setTheme={setTheme} />;
      case 'help': return <HelpFAQ />;
      case 'download': return <DownloadHistory />;
      case 'history': return <RewriteHistoryPage />;
      default: return (
        <div style={{ color: 'var(--text-muted)', marginTop: '20px' }}>
          {chrome.i18n.getMessage('underConstruction')}
        </div>
      );
    }
  };

  return (
    <>
      <style>{themeVars}</style>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          {renderContent()}
        </main>
      </div>
    </>
  );
};
