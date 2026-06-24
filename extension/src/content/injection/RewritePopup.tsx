import React, { useState, useEffect, useCallback } from 'react';
import { RewriteMode, RewriteResponse, ChromeMessage } from '../../shared/types/index';
import { TextReplacer } from '../replacement/TextReplacer';
import { REWRITE_MODE_LABELS } from '../../shared/constants/rewriteModes';

interface RewritePopupProps {
  selectedText: string;
  initialMode?: RewriteMode;
  rect: DOMRect;
  onClose: () => void;
}

type PopupState = 'idle' | 'loading' | 'done' | 'error';

export const RewritePopup: React.FC<RewritePopupProps> = ({
  selectedText,
  initialMode = 'improve',
  rect,
  onClose,
}) => {
  const [mode, setMode] = useState<RewriteMode>(initialMode);
  const [state, setState] = useState<PopupState>('idle');
  const [output, setOutput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [modelUsed, setModelUsed] = useState('');
  const [switchedFrom, setSwitchedFrom] = useState('');
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const MODES: RewriteMode[] = [
    'improve','grammar','professional','friendly','formal','casual',
    'persuasive','confident','shorten','expand','simplify','humanize','custom',
  ];

  // Calculate popup position
  const POPUP_WIDTH = 480;
  const POPUP_MAX_HEIGHT = 520;
  const MARGIN = 12;

  let top = rect.bottom + window.scrollY + MARGIN;
  let left = rect.left + window.scrollX;

  const vpWidth = window.innerWidth;
  if (left + POPUP_WIDTH > vpWidth - MARGIN) left = vpWidth - POPUP_WIDTH - MARGIN;
  if (left < MARGIN) left = MARGIN;

  const spaceBelow = window.innerHeight - rect.bottom;
  if (spaceBelow < POPUP_MAX_HEIGHT && rect.top > POPUP_MAX_HEIGHT) {
    top = rect.top + window.scrollY - POPUP_MAX_HEIGHT - MARGIN;
  }

  const doRewrite = useCallback(async (selectedMode: RewriteMode) => {
    setState('loading');
    setOutput('');
    setErrorMsg('');
    setSwitchedFrom('');

    try {
      const response = await new Promise<RewriteResponse>((resolve, reject) => {
        const msg: ChromeMessage = {
          type: 'REWRITE_TEXT',
          payload: { text: selectedText, mode: selectedMode },
        };
        chrome.runtime.sendMessage(msg, (res: RewriteResponse & { error?: string }) => {
          if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
          if (res.error) return reject(new Error(res.error));
          resolve(res);
        });
      });

      setOutput(response.output);
      setModelUsed(response.modelUsed);
      if (response.switchedFrom) setSwitchedFrom(response.switchedFrom);
      setState('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Rewrite failed');
      setState('error');
    }
  }, [selectedText]);

  // Auto-rewrite on mount
  useEffect(() => {
    doRewrite(initialMode);
  }, [doRewrite, initialMode]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleReplace = () => {
    if (!output) return;
    TextReplacer.replace(output);
    onClose();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModeChange = (newMode: RewriteMode) => {
    setMode(newMode);
    doRewrite(newMode);
  };

  const styles = {
    overlay: {
      position: 'absolute' as const,
      top: `${top}px`,
      left: `${left}px`,
      width: `${POPUP_WIDTH}px`,
      zIndex: 2147483646,
      background: '#1A1A1E',
      borderRadius: '12px',
      border: '1px solid #2A2A32',
      boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#F0F0F2',
      fontSize: '14px',
      padding: '16px',
      animation: 'aiPopupSlideIn 150ms ease forwards',
    },
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="AI Rewrite">
      <style>{`
        @keyframes aiPopupSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ai-chip { transition: all 0.15s ease; }
        .ai-chip:hover { background: #7C6EF8 !important; color: white !important; border-color: #7C6EF8 !important; }
        .ai-btn { transition: all 0.15s ease; }
        .ai-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .ai-btn:active { transform: translateY(0); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>✨</span>
          <span style={{ fontWeight: 600, color: '#F0F0F2' }}>AI Rewrite</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#8B8B9A', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
          aria-label="Close"
        >×</button>
      </div>

      {/* Mode selector chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginBottom: '12px' }}>
        {MODES.map((m) => (
          <button
            key={m}
            className="ai-chip"
            onClick={() => handleModeChange(m)}
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              border: `1px solid ${mode === m ? '#7C6EF8' : '#2A2A32'}`,
              background: mode === m ? '#7C6EF8' : 'transparent',
              color: mode === m ? 'white' : '#8B8B9A',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: mode === m ? 600 : 400,
            }}
          >
            {REWRITE_MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Original text (collapsible) */}
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          style={{ background: 'none', border: 'none', color: '#8B8B9A', cursor: 'pointer', fontSize: '12px', padding: 0 }}
        >
          {showOriginal ? '▾' : '▸'} Original text
        </button>
        {showOriginal && (
          <div style={{
            marginTop: '6px', padding: '10px', background: '#0F0F10',
            borderRadius: '8px', color: '#8B8B9A', fontSize: '13px',
            maxHeight: '80px', overflowY: 'auto', lineHeight: 1.5,
          }}>
            {selectedText}
          </div>
        )}
      </div>

      {/* Output area */}
      <div style={{
        minHeight: '100px', background: '#0F0F10', borderRadius: '8px',
        border: '1px solid #2A2A32', padding: '12px', marginBottom: '12px',
        position: 'relative', lineHeight: 1.6,
      }}>
        {state === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
            {[100, 80, 60].map((w, i) => (
              <div key={i} style={{
                height: '14px', background: '#2A2A32', borderRadius: '4px', width: `${w}%`,
                animation: 'aiSkeleton 1.5s ease infinite', animationDelay: `${i * 0.2}s`,
              }} />
            ))}
            <style>{`
              @keyframes aiSkeleton {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 0.8; }
              }
            `}</style>
          </div>
        )}
        {state === 'done' && (
          <>
            <p style={{ margin: 0, color: '#F0F0F2', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{output}</p>
            {modelUsed && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#8B8B9A' }}>
                Model: {modelUsed}
                {switchedFrom && ` (switched from ${switchedFrom})`}
              </div>
            )}
          </>
        )}
        {state === 'error' && (
          <p style={{ margin: 0, color: '#f87171', fontSize: '13px' }}>⚠️ {errorMsg}</p>
        )}
        {state === 'idle' && (
          <p style={{ margin: 0, color: '#8B8B9A', fontSize: '13px' }}>Select a mode to rewrite...</p>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="ai-btn"
          onClick={handleReplace}
          disabled={state !== 'done'}
          style={{
            flex: 1, padding: '8px', borderRadius: '8px',
            background: state === 'done' ? '#7C6EF8' : '#2A2A32',
            color: state === 'done' ? 'white' : '#8B8B9A',
            border: 'none', cursor: state === 'done' ? 'pointer' : 'not-allowed',
            fontWeight: 600, fontSize: '13px',
          }}
        >
          Replace
        </button>
        <button
          className="ai-btn"
          onClick={handleCopy}
          disabled={state !== 'done'}
          style={{
            padding: '8px 14px', borderRadius: '8px',
            background: '#2A2A32', color: copied ? '#4ADE80' : '#F0F0F2',
            border: '1px solid #3A3A45', cursor: state === 'done' ? 'pointer' : 'not-allowed',
            fontSize: '13px',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <button
          className="ai-btn"
          onClick={() => doRewrite(mode)}
          disabled={state === 'loading'}
          style={{
            padding: '8px 14px', borderRadius: '8px',
            background: '#2A2A32', color: '#F0F0F2',
            border: '1px solid #3A3A45', cursor: state !== 'loading' ? 'pointer' : 'not-allowed',
            fontSize: '13px',
          }}
        >
          ↺ Retry
        </button>
        <button
          className="ai-btn"
          onClick={async () => {
            if (!output) return;
            const msg: ChromeMessage = {
              type: 'REWRITE_TEXT',
              payload: { text: output, mode },
            };
            chrome.runtime.sendMessage(msg);
          }}
          disabled={state !== 'done'}
          style={{
            padding: '8px 14px', borderRadius: '8px',
            background: '#2A2A32', color: '#F0F0F2',
            border: '1px solid #3A3A45', cursor: state === 'done' ? 'pointer' : 'not-allowed',
            fontSize: '13px',
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};
