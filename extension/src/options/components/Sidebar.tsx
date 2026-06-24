import React from 'react';
import { User, Settings, HelpCircle, FileDown, History } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'account', label: 'Account & Usage', icon: User },
    { id: 'history', label: 'Rewrite History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'download', label: 'Download', icon: FileDown },
    { id: 'help', label: 'Help & FAQ', icon: HelpCircle },
  ];

  return (
    <div style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      height: '100vh',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '8px' }}>
        <div style={{ background: 'var(--primary)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#FFF" strokeLinejoin="round"/>
            <path d="M19 3L19.8 5.2L22 6L19.8 6.8L19 9L18.2 6.8L16 6L18.2 5.2L19 3Z" fill="#FFF" opacity="0.8"/>
          </svg>
        </div>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>AI Rewrite Dashboard</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? 'var(--primary-bg)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s',
              }}
            >
              <item.icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
              <span style={{ flexGrow: 1 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
