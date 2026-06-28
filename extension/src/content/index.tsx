import React, { useState, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { SelectionTracker, SelectionInfo } from './selection/SelectionTracker';
import { FloatingButton } from './injection/FloatingButton';
import { RewritePopup } from './injection/RewritePopup';
import { RewriteMode } from '../shared/types/index';

// ─── Command Palette ──────────────────────────────────────────────────────────
const QUICK_MODES: { mode: RewriteMode }[] = [
  { mode: 'professional' },
  { mode: 'shorten' },
  { mode: 'grammar' },
  { mode: 'friendly' },
  { mode: 'persuasive' },
];

const CommandPalette: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [value, setValue] = useState('');
  const [userPlan, setUserPlan] = useState<string>('free');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    chrome.storage.local.get('ai_rewrite_user', (result) => {
      const user = result['ai_rewrite_user'];
      if (user && user.plan) {
        setUserPlan(user.plan);
      }
    });
  }, []);

  const handleSubmit = (mode: RewriteMode, customPrompt?: string) => {
    if (userPlan === 'free' && mode !== 'improve') {
      alert(chrome.i18n.getMessage('commandPaletteLockedAlert'));
      return;
    }
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    if (!text) { onClose(); return; }
    chrome.runtime.sendMessage({
      type: 'REWRITE_TEXT',
      payload: { text, mode, customPrompt },
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2147483647, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1A1A1E', borderRadius: '12px', border: '1px solid #2A2A32',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)', padding: '20px', width: '480px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ color: '#8B8B9A', fontSize: '12px' }}>
            {chrome.i18n.getMessage('commandPaletteTitle')}
          </div>
          {userPlan === 'free' && (
            <div style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 600 }}>
              {chrome.i18n.getMessage('commandPaletteFreeWarning')}
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit('custom', value);
            if (e.key === 'Escape') onClose();
          }}
          disabled={userPlan === 'free'}
          placeholder={userPlan === 'free' ? chrome.i18n.getMessage('commandPalettePlaceholderFree') : chrome.i18n.getMessage('commandPalettePlaceholderPro')}
          style={{
            width: '100%', background: '#0F0F10', border: '1px solid #2A2A32',
            borderRadius: '8px', padding: '10px 12px', color: userPlan === 'free' ? '#5B5B6A' : '#F0F0F2',
            fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
            cursor: userPlan === 'free' ? 'not-allowed' : 'text'
          }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' as const }}>
          {QUICK_MODES.map((q) => {
            const isLocked = userPlan === 'free';
            return (
              <button
                key={q.mode}
                onClick={() => {
                  if (isLocked) {
                    alert(chrome.i18n.getMessage('commandPaletteLockedModesAlert'));
                  } else {
                    handleSubmit(q.mode);
                  }
                }}
                style={{
                  padding: '5px 12px', borderRadius: '999px', background: '#2A2A32',
                  border: '1px solid #3A3A45', color: isLocked ? '#5B5B6A' : '#F0F0F2', cursor: 'pointer',
                  fontSize: '12px', transition: 'all 0.15s',
                  opacity: isLocked ? 0.6 : 1
                }}
              >
                {chrome.i18n.getMessage('mode_' + q.mode)} {isLocked && '🔒'}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Content Script Root ──────────────────────────────────────────────────────
let root: Root | null = null;
let container: HTMLDivElement | null = null;

function getOrCreateContainer(): { container: HTMLDivElement; root: Root } {
  let existing = document.getElementById('ai-rewrite-anywhere-root') as HTMLDivElement | null;
  if (!existing) {
    existing = document.createElement('div');
    existing.id = 'ai-rewrite-anywhere-root';
    if (document.body) {
      document.body.appendChild(existing);
    } else {
      document.documentElement.appendChild(existing);
    }
  }
  container = existing;

  const globalKey = '__ai_rewrite_root__';
  const anyWindow = window as any;
  if (!anyWindow[globalKey]) {
    anyWindow[globalKey] = createRoot(existing);
  }
  root = anyWindow[globalKey];

  return { container: container!, root: root! };
}

// ─── App Component ────────────────────────────────────────────────────────────
type AppView =
  | { type: 'none' }
  | { type: 'button'; selection: SelectionInfo }
  | { type: 'popup'; text: string; rect: DOMRect; mode: RewriteMode; autoRun?: boolean }
  | { type: 'commandPalette' };

const App: React.FC = () => {
  const [view, setView] = useState<AppView>({ type: 'none' });
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showLoginToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast('Please sign in to the extension first to use AI Rewrite.');
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 10000);
  };

  useEffect(() => {
    const tracker = new SelectionTracker((info) => {
      if (info) {
        setView((v) => (v.type === 'none' || v.type === 'button' ? { type: 'button', selection: info } : v));
      } else {
        setView((v) => (v.type === 'button' ? { type: 'none' } : v));
      }
    });
    tracker.start();

    // Listen for messages from background (context menu / command palette)
    const listener = async (message: { type: string; payload?: { text?: string; mode?: RewriteMode } }) => {
      if (message.type === 'OPEN_REWRITE_POPUP' && message.payload?.text) {
        const result = await chrome.storage.local.get('ai_rewrite_jwt');
        if (!result['ai_rewrite_jwt']) {
          showLoginToast();
          return;
        }
        const selection = window.getSelection();
        const rect = selection?.rangeCount
          ? selection.getRangeAt(0).getBoundingClientRect()
          : new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 0, 0);
        setView({
          type: 'popup',
          text: message.payload.text,
          rect,
          mode: message.payload.mode ?? 'improve',
          autoRun: true,
        });
      }
      if (message.type === 'OPEN_COMMAND_PALETTE') {
        setView({ type: 'commandPalette' });
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    // Click-away to close button
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('#ai-rewrite-anywhere-root')) return;
      setView((v) => (v.type === 'button' ? { type: 'none' } : v));
    };
    document.addEventListener('click', handleDocClick, true);

    return () => {
      tracker.stop();
      chrome.runtime.onMessage.removeListener(listener);
      document.removeEventListener('click', handleDocClick, true);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {view.type === 'button' && (
        <FloatingButton
          rect={view.selection.rect}
          onClick={async () => {
            const result = await chrome.storage.local.get('ai_rewrite_jwt');
            if (!result['ai_rewrite_jwt']) {
              showLoginToast();
              return;
            }
            setView({
              type: 'popup',
              text: view.selection.text,
              rect: view.selection.rect,
              mode: 'improve',
              autoRun: false,
            });
          }}
        />
      )}

      {view.type === 'popup' && (
        <RewritePopup
          selectedText={view.text}
          initialMode={view.mode}
          rect={view.rect}
          autoRun={view.autoRun}
          onClose={() => setView({ type: 'none' })}
        />
      )}

      {view.type === 'commandPalette' && (
        <CommandPalette onClose={() => setView({ type: 'none' })} />
      )}

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 2147483647,
          background: '#1A1A1E',
          color: '#F0F0F2',
          border: '1px solid #7C6EF8',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          maxWidth: '360px',
          animation: 'aiToastSlideIn 200ms ease forwards',
        }}>
          <style>{`
            @keyframes aiToastSlideIn {
              from { opacity: 0; transform: translateY(12px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          <span style={{ fontSize: '18px' }}>🔐</span>
          <div style={{ flexGrow: 1, lineHeight: 1.4 }}>{toast}</div>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'none', border: 'none', color: '#8B8B9A',
              cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', padding: 0
            }}
          >×</button>
        </div>
      )}
    </>
  );
};

// ─── Mount ────────────────────────────────────────────────────────────────────
const { root: appRoot } = getOrCreateContainer();
appRoot.render(<App />);
