import React, { useState, useEffect, useCallback } from 'react';
import { RewriteHistoryItem, ChromeMessage, PaginatedHistory } from '../../shared/types/index';
import { REWRITE_MODE_LABELS } from '../../shared/constants/rewriteModes';

export const RewriteHistoryPage: React.FC = () => {
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

  if (!loading && items.length === 0) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)' }}>Rewrite History</h1>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>No rewrites yet</div>
          <div style={{ fontSize: '14px' }}>
            Highlight text on any page and click ✨ to get started. Your history will appear here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)' }}>Rewrite History</h1>
      
      <div>
        {items.map((item) => (
          <div key={item.id} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
            padding: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{
                padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                background: 'var(--icon-bg)', color: 'var(--text-main)', border: '1px solid var(--border)',
              }}>
                {REWRITE_MODE_LABELS[item.mode]}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                {new Date(item.createdAt).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Original Text</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, fontStyle: 'italic', background: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {item.originalText}
                </div>
              </div>

              <div style={{ flex: '1 1 400px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Rewritten Text</div>
                <div style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: 1.6, background: 'var(--primary-bg)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(124, 110, 248, 0.2)' }}>
                  {item.rewrittenText}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                style={{
                  background: copiedId === item.id ? '#10b981' : 'var(--bg-main)',
                  color: copiedId === item.id ? 'white' : 'var(--text-main)',
                  border: `1px solid ${copiedId === item.id ? '#10b981' : 'var(--border)'}`,
                  borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                }}
                onClick={() => copyToClipboard(item.rewrittenText, item.id)}
              >
                {copiedId === item.id ? '✓ Copied!' : '📋 Copy Rewritten'}
              </button>
            </div>
          </div>
        ))}

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            style={{
              width: '100%', padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', color: 'var(--text-main)', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
              marginTop: '8px', transition: 'all 0.2s'
            }}
          >
            {loading ? 'Loading...' : 'Load older rewrites'}
          </button>
        )}
      </div>
    </div>
  );
};
