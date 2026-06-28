import React, { useState, useEffect, useCallback } from 'react';
import { RewriteHistoryItem, ChromeMessage, PaginatedHistory } from '../../shared/types/index';

export const RewriteHistory: React.FC = () => {
  const [items, setItems] = useState<RewriteHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadHistory = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await new Promise<PaginatedHistory & { error?: string }>(
        (resolve, reject) =>
          chrome.runtime.sendMessage(
            { type: 'GET_HISTORY', payload: { page: pageNum, limit: 20 } } as ChromeMessage,
            (res) => {
              if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
              else resolve(res);
            }
          )
      );
      if (response.error) throw new Error(response.error);
      setItems((prev) => (pageNum === 1 ? response.items : [...prev, ...response.items]));
      setHasMore(response.hasMore);
    } catch (err) {
      console.error('[History]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(1);
  }, [loadHistory]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadHistory(nextPage);
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const s = {
    item: {
      background: '#1A1A1E', border: '1px solid #2A2A32', borderRadius: '8px',
      padding: '12px', marginBottom: '8px',
    },
    arrow: { color: '#8B8B9A', margin: '4px 0', fontSize: '12px' },
    text: { fontSize: '13px', color: '#F0F0F2', lineHeight: 1.5 },
    mutedText: { fontSize: '12px', color: '#8B8B9A' },
    badge: {
      padding: '2px 8px', borderRadius: '999px', fontSize: '11px',
      background: '#2A2A32', color: '#8B8B9A', border: '1px solid #3A3A45',
    },
    copyBtn: {
      background: 'none', border: '1px solid #3A3A45', borderRadius: '6px',
      padding: '3px 10px', cursor: 'pointer', fontSize: '12px', color: '#8B8B9A',
      transition: 'all 0.15s',
    },
  };

  if (!loading && items.length === 0) {
    return (
      <div style={{ textAlign: 'center' as const, color: '#8B8B9A', padding: '40px 20px' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
        <div>{chrome.i18n.getMessage('sidepanelNoHistory')}</div>
        <div style={{ fontSize: '12px', marginTop: '8px' }}>
          {chrome.i18n.getMessage('sidepanelHighlightText')}
        </div>
      </div>
    );
  }

  return (
    <div>
      {items.map((item) => (
        <div key={item.id} style={s.item}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={s.badge}>{chrome.i18n.getMessage('mode_' + item.mode)}</span>
            </div>
            <span style={s.mutedText}>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>

          <div style={{ ...s.mutedText, marginBottom: '4px' }}>{chrome.i18n.getMessage('sidepanelOriginal')}</div>
          <div style={{ ...s.text, color: '#8B8B9A', marginBottom: '6px', fontStyle: 'italic' }}>
            {item.originalText.slice(0, 120)}{item.originalText.length > 120 ? '...' : ''}
          </div>

          <div style={{ ...s.mutedText, marginBottom: '4px' }}>{chrome.i18n.getMessage('sidepanelRewritten')}</div>
          <div style={{ ...s.text, marginBottom: '10px' }}>
            {item.rewrittenText.slice(0, 200)}{item.rewrittenText.length > 200 ? '...' : ''}
          </div>

          <button
            style={{ ...s.copyBtn, color: copiedId === item.id ? '#4ADE80' : '#8B8B9A' }}
            onClick={() => copyToClipboard(item.rewrittenText, item.id)}
          >
            {copiedId === item.id ? chrome.i18n.getMessage('btnCopied') : chrome.i18n.getMessage('btnCopy')}
          </button>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          style={{
            width: '100%', padding: '10px', background: '#2A2A32', border: '1px solid #3A3A45',
            borderRadius: '8px', color: '#F0F0F2', cursor: 'pointer', fontSize: '13px',
          }}
        >
          {loading ? chrome.i18n.getMessage('loading') : chrome.i18n.getMessage('sidepanelLoadMore')}
        </button>
      )}
    </div>
  );
};
