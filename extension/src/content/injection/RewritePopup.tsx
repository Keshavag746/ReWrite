import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RewriteMode, RewriteResponse, ChromeMessage } from '../../shared/types/index';
import { TextReplacer } from '../replacement/TextReplacer';

interface RewritePopupProps {
  selectedText: string;
  initialMode?: RewriteMode;
  rect: DOMRect;
  onClose: () => void;
  autoRun?: boolean;
}

type PopupState = 'idle' | 'loading' | 'done' | 'error';

export const RewritePopup: React.FC<RewritePopupProps> = ({
  selectedText,
  initialMode = 'improve',
  rect,
  onClose,
  autoRun = true,
}) => {
  const [mode, setMode] = useState<RewriteMode>(initialMode);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [state, setState] = useState<PopupState>('idle');
  const [output, setOutput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [saved, setSaved] = useState(false);

  const MODES: RewriteMode[] = [
    'improve', 'grammar', 'professional', 'friendly', 'formal', 'casual',
    'persuasive', 'confident', 'shorten', 'expand', 'simplify', 'humanize', 'custom',
  ];

  // Calculate popup position constants
  const POPUP_WIDTH = 480;
  const POPUP_MAX_HEIGHT = 520;
  const MARGIN = 12;

  const getInitialPosition = useCallback(() => {
    let topVal = rect.bottom + window.scrollY + MARGIN;
    let leftVal = rect.left + window.scrollX;

    const vpWidth = window.innerWidth;
    if (leftVal + POPUP_WIDTH > vpWidth - MARGIN) leftVal = vpWidth - POPUP_WIDTH - MARGIN;
    if (leftVal < MARGIN) leftVal = MARGIN;

    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < POPUP_MAX_HEIGHT && rect.top > POPUP_MAX_HEIGHT) {
      topVal = rect.top + window.scrollY - POPUP_MAX_HEIGHT - MARGIN;
    }
    return { x: leftVal, y: topVal };
  }, [rect]);

  const [position, setPosition] = useState<{ x: number; y: number }>(() => getInitialPosition());
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });

  useEffect(() => {
    setPosition(getInitialPosition());
  }, [rect, getInitialPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;

    setIsDragging(true);
    dragStartRef.current = {
      offsetX: e.clientX - position.x,
      offsetY: e.clientY - position.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStartRef.current.offsetX;
      const newY = e.clientY - dragStartRef.current.offsetY;
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const doRewrite = useCallback(async (selectedMode: RewriteMode) => {
    setState('loading');
    setOutput('');
    setErrorMsg('');
    setSaved(false);

    try {
      const result = await chrome.storage.local.get('ai_rewrite_user');
      const user = result['ai_rewrite_user'];
      const plan = user?.plan || 'free';

      if (plan === 'free' && selectedMode !== 'improve') {
        throw new Error(chrome.i18n.getMessage('freePlanModesAlert'));
      }

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
      setState('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : chrome.i18n.getMessage('rewriteFailed'));
      setState('error');
    }
  }, [selectedText]);

  // Load user plan on mount and auto-rewrite if autoRun is true
  useEffect(() => {
    chrome.storage.local.get('ai_rewrite_user', (result) => {
      const user = result['ai_rewrite_user'];
      if (user && user.plan) {
        setUserPlan(user.plan);
      }
    });
    if (autoRun) {
      doRewrite(initialMode);
    }
  }, [doRewrite, initialMode, autoRun]);

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
    if (userPlan === 'free' && newMode !== 'improve') {
      alert(chrome.i18n.getMessage('freePlanModesPopupAlert'));
      return;
    }
    setMode(newMode);
    setSaved(false);
    doRewrite(newMode);
  };

  const styles = {
    overlay: {
      position: 'absolute' as const,
      top: `${position.y}px`,
      left: `${position.x}px`,
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
    <div style={styles.overlay} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={chrome.i18n.getMessage('popupTitleLabel')}>
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
        .ai-close-btn { transition: all 0.15s ease; }
        .ai-close-btn:hover { color: #EF4444 !important; transform: scale(1.25); }
        .ai-close-btn:active { transform: scale(0.95); }
      `}</style>

      {/* Header */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>✨</span>
          <span style={{ fontWeight: 600, color: '#F0F0F2' }}>{chrome.i18n.getMessage('popupTitleLabel')}</span>
          <span style={{ fontSize: '10px', color: '#8B8B9A', marginLeft: '6px', fontStyle: 'italic' }}>({chrome.i18n.getMessage('dragToMoveLabel') || 'drag header to move'})</span>
        </div>
        <button
          onClick={onClose}
          className="ai-close-btn"
          style={{
            background: 'none',
            border: 'none',
            color: '#F87171',
            cursor: 'pointer',
            fontSize: '26px',
            lineHeight: 1,
            fontWeight: 'bold',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label={chrome.i18n.getMessage('popupCloseLabel')}
        >
          &times;
        </button>
      </div>

      {/* Mode selector chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginBottom: '12px' }}>
        {MODES.map((m) => {
          const isLocked = userPlan === 'free' && m !== 'improve';
          return (
            <button
              key={m}
              className="ai-chip"
              onClick={() => handleModeChange(m)}
              style={{
                padding: '4px 10px',
                borderRadius: '999px',
                border: `1px solid ${mode === m ? '#7C6EF8' : '#2A2A32'}`,
                background: mode === m ? '#7C6EF8' : 'transparent',
                color: mode === m ? 'white' : (isLocked ? '#8B8B9A' : '#E4E4E7'),
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: mode === m ? 600 : 400,
                opacity: isLocked ? 0.75 : 1,
              }}
            >
              {chrome.i18n.getMessage('mode_' + m)} {isLocked && '🔒'}
            </button>
          );
        })}
      </div>

      {/* Original text (collapsible) */}
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          style={{ background: 'none', border: 'none', color: '#8B8B9A', cursor: 'pointer', fontSize: '12px', padding: 0 }}
        >
          {showOriginal ? '▾' : '▸'} {chrome.i18n.getMessage('popupOriginalTextLabel')}
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
          </>
        )}
        {state === 'error' && (
          <p style={{ margin: 0, color: '#f87171', fontSize: '13px' }}>⚠️ {errorMsg}</p>
        )}
        {state === 'idle' && (
          <p style={{ margin: 0, color: '#8B8B9A', fontSize: '13px' }}>{chrome.i18n.getMessage('popupPlaceholder')}</p>
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
          {chrome.i18n.getMessage('btnReplace')}
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
          {copied ? chrome.i18n.getMessage('btnCopied') : chrome.i18n.getMessage('btnCopy')}
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
          {chrome.i18n.getMessage('btnRetry')}
        </button>
        <button
          className="ai-btn"
          onClick={() => {
            setSaved(true);
          }}
          disabled={state !== 'done' || saved}
          style={{
            padding: '8px 14px', borderRadius: '8px',
            background: saved ? '#10B981' : '#2A2A32',
            color: saved ? 'white' : '#F0F0F2',
            border: saved ? '1px solid #10B981' : '1px solid #3A3A45',
            cursor: state === 'done' && !saved ? 'pointer' : 'not-allowed',
            fontSize: '13px',
          }}
        >
          {saved ? 'Saved ✓' : chrome.i18n.getMessage('btnSave')}
        </button>
      </div>
    </div>
  );
};
