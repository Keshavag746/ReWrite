import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

export const DownloadHistory: React.FC = () => {
  const [format, setFormat] = useState('PDF');
  const [filenameFormat, setFilenameFormat] = useState('date');
  const [customTitle, setCustomTitle] = useState('');
  const [exporting, setExporting] = useState(false);
  const [userPlan, setUserPlan] = useState<string>('free');

  useEffect(() => {
    chrome.storage.local.get('ai_rewrite_user', (result) => {
      const user = result['ai_rewrite_user'];
      if (user && user.plan) {
        setUserPlan(user.plan);
        if (user.plan === 'free') {
          setFormat('PDF');
        }
      }
    });
  }, []);

  const formats = [
    { id: 'PDF', label: 'PDF', icon: '📄' },
    { id: 'MD', label: 'MD', icon: '📝' },
    { id: 'TXT', label: 'TXT', icon: '📋' },
    { id: 'IMG', label: 'IMG', icon: '🖼️' },
    { id: 'JSON', label: 'JSON', icon: '⚙️' },
    { id: 'COPY', label: 'COPY', icon: '📑' },
  ];

  const triggerDownload = (content: string, mimeType: string, filename: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchHistory = async () => {
    return new Promise<any[]>((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'GET_HISTORY', payload: { page: 1, limit: 1000 } },
        (res) => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve(res.items || []);
        }
      );
    });
  };

  const authenticateDropbox = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const clientId = 'apgx7h9c6h8ov9x';
      const redirectUri = chrome.identity.getRedirectURL();
      const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}`;

      chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          reject(new Error(chrome.runtime.lastError?.message || 'Dropbox authentication cancelled.'));
          return;
        }
        
        const hash = new URL(redirectUrl).hash;
        if (!hash) {
          reject(new Error('Failed to obtain Dropbox access token.'));
          return;
        }
        
        const urlParams = new URLSearchParams(hash.substring(1));
        const token = urlParams.get('access_token');
        if (token) {
          resolve(token);
        } else {
          reject(new Error('Failed to obtain Dropbox access token.'));
        }
      });
    });
  };

  const authenticateGoogleDrive = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError || !token) {
          reject(new Error(chrome.runtime.lastError?.message || 'Google Drive authentication failed.'));
        } else {
          resolve(token);
        }
      });
    });
  };

  const uploadToGoogleDrive = async (blob: Blob, filename: string, token: string) => {
    const metadata = { name: filename, mimeType: blob.type || 'application/octet-stream' };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: form
    });
    
    if (!res.ok) {
      throw new Error(`Google Drive upload failed: ${res.statusText}`);
    }
  };

  const uploadToDropbox = async (blob: Blob, filename: string, token: string) => {
    const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Dropbox-API-Arg': JSON.stringify({
          path: '/' + filename,
          mode: 'add',
          autorename: true
        }),
        'Content-Type': 'application/octet-stream'
      },
      body: blob
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Dropbox API Error (${res.status}): ${errText}`);
    }
  };

  const handleExport = async (destination: 'local' | 'dropbox' | 'gdrive') => {
    try {
      setExporting(true);
      
      let cloudToken = '';
      if (destination === 'dropbox') {
        try {
          cloudToken = await authenticateDropbox();
        } catch (e: any) {
          alert(e.message);
          setExporting(false);
          return;
        }
      } else if (destination === 'gdrive') {
        try {
          cloudToken = await authenticateGoogleDrive();
        } catch (e: any) {
          alert(e.message);
          setExporting(false);
          return;
        }
      }

      const items = await fetchHistory();
      
      if (items.length === 0) {
        alert('No history found to export.');
        setExporting(false);
        return;
      }

      const dateStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toLocaleTimeString();
      let filename = `RewriteHistory_${dateStr}`;
      
      if (filenameFormat === 'custom' && customTitle.trim() !== '') {
        filename = customTitle.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
      }

      const formatToUse = (destination !== 'local' && format === 'COPY') ? 'TXT' : format;

      const uploadToCloud = async (blob: Blob, fname: string) => {
        if (destination === 'dropbox') {
          await uploadToDropbox(blob, fname, cloudToken);
        } else if (destination === 'gdrive') {
          await uploadToGoogleDrive(blob, fname, cloudToken);
        }
      };

      if (formatToUse === 'JSON') {
        const exportData = {
          exportedAt: `${dateStr} ${timeStr}`,
          totalRewrites: items.length,
          history: items
        };
        const jsonStr = JSON.stringify(exportData, null, 2);
        
        if (destination !== 'local') {
          await uploadToCloud(new Blob([jsonStr], { type: 'application/json' }), `${filename}.json`);
        } else {
          triggerDownload(jsonStr, 'application/json', `${filename}.json`);
        }
      } else if (formatToUse === 'TXT' || formatToUse === 'COPY') {
        let txtStr = `================================================================================\n`;
        txtStr += `AI REWRITE ANYWHERE - HISTORY EXPORT\n`;
        txtStr += `Exported on: ${dateStr} at ${timeStr}\n`;
        txtStr += `Total Items: ${items.length}\n`;
        txtStr += `================================================================================\n\n`;
        
        items.forEach((item, index) => {
          txtStr += `[${index + 1}] MODE: ${item.mode.toUpperCase()}\n`;
          txtStr += `Date: ${new Date(item.createdAt).toLocaleString()}\n`;
          txtStr += `--------------------------------------------------------------------------------\n`;
          txtStr += `ORIGINAL TEXT:\n${item.originalText}\n\n`;
          txtStr += `REWRITTEN TEXT:\n${item.rewrittenText}\n`;
          txtStr += `================================================================================\n\n`;
        });

        if (destination !== 'local') {
          await uploadToCloud(new Blob([txtStr], { type: 'text/plain' }), `${filename}.txt`);
        } else if (formatToUse === 'TXT') {
          triggerDownload(txtStr, 'text/plain', `${filename}.txt`);
        } else {
          await navigator.clipboard.writeText(txtStr);
          alert('History beautifully formatted and copied to clipboard!');
        }
      } else if (formatToUse === 'MD') {
        let mdStr = `# AI Rewrite Anywhere - History Export\n\n`;
        mdStr += `**Exported on:** ${dateStr} at ${timeStr}  \n`;
        mdStr += `**Total Items:** ${items.length}  \n\n`;
        mdStr += `---\n\n`;
        
        items.forEach((item, index) => {
          mdStr += `### ${index + 1}. Mode: **${item.mode.toUpperCase()}**\n`;
          mdStr += `*Date: ${new Date(item.createdAt).toLocaleString()}*\n\n`;
          mdStr += `#### Original Text:\n`;
          mdStr += `> ${item.originalText.replace(/\n/g, '\n> ')}\n\n`;
          mdStr += `#### Rewritten Text:\n`;
          mdStr += `> ${item.rewrittenText.replace(/\n/g, '\n> ')}\n\n`;
          mdStr += `---\n\n`;
        });
        
        if (destination !== 'local') {
          await uploadToCloud(new Blob([mdStr], { type: 'text/markdown' }), `${filename}.md`);
        } else {
          triggerDownload(mdStr, 'text/markdown', `${filename}.md`);
        }
      } else if (formatToUse === 'PDF') {
        const html2pdf = (await import('html2pdf.js')).default;
        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.color = '#333';
        container.style.fontFamily = 'Helvetica, Arial, sans-serif';

        container.innerHTML = `<h1 style="color: #7C6EF8; margin-bottom: 5px;">AI Rewrite Anywhere</h1><h3 style="color: #666; margin-top: 0; margin-bottom: 20px;">History Export - ${dateStr}</h3>`;

        items.forEach((item, i) => {
          container.innerHTML += `
            <div style="page-break-inside: avoid; margin-bottom: 20px; background: #f9f9fb; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="font-weight: bold; font-size: 12px; background: #e0dcfc; color: #7C6EF8; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-bottom: 12px;">
                [${i + 1}] MODE: ${item.mode.toUpperCase()}
              </div>
              <div style="font-size: 11px; font-weight: bold; color: #888; margin-bottom: 4px;">ORIGINAL TEXT:</div>
              <div style="font-size: 12px; font-style: italic; color: #555; margin-bottom: 12px; line-height: 1.5;">${item.originalText}</div>
              <div style="font-size: 11px; font-weight: bold; color: #7C6EF8; margin-bottom: 4px;">REWRITTEN TEXT:</div>
              <div style="font-size: 12px; color: #222; line-height: 1.5;">${item.rewrittenText}</div>
            </div>
          `;
        });

        const opt = {
          margin:       10,
          filename:     `${filename}.pdf`,
          image:        { type: 'jpeg' as const, quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        if (destination !== 'local') {
          const pdfBlob = await html2pdf().set(opt).from(container).output('blob');
          await uploadToCloud(pdfBlob, `${filename}.pdf`);
        } else {
          await html2pdf().set(opt).from(container).save();
        }
      } else if (formatToUse === 'IMG') {
        const chunks = [];
        for (let i = 0; i < items.length; i += 4) {
          chunks.push(items.slice(i, i + 4));
        }

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.background = '#161b22';
          container.style.color = '#F0F0F2';
          container.style.padding = '40px';
          container.style.width = '800px';
          container.style.fontFamily = 'Inter, sans-serif';
          
          container.innerHTML = `<h1 style="margin-top:0; color: #F0F0F2">Rewrite History - ${dateStr} ${chunks.length > 1 ? `(Part ${i + 1})` : ''}</h1>`;
          chunk.forEach(item => {
             container.innerHTML += `
               <div style="margin-bottom: 24px; border-bottom: 1px solid #30363d; padding-bottom: 16px;">
                 <span style="background: rgba(124, 110, 248, 0.2); color: #7C6EF8; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">MODE: ${item.mode.toUpperCase()}</span><br/><br/>
                 <strong style="color: #8b949e; font-size: 13px; letter-spacing: 1px;">ORIGINAL TEXT</strong><br/>
                 <div style="margin-top: 8px; margin-bottom: 16px; font-style: italic; line-height: 1.5">${item.originalText}</div>
                 <strong style="color: #7C6EF8; font-size: 13px; letter-spacing: 1px;">REWRITTEN TEXT</strong><br/>
                 <div style="margin-top: 8px; line-height: 1.5; font-weight: 500">${item.rewrittenText}</div>
               </div>
             `;
          });
          
          document.body.appendChild(container);
          
          const canvas = await html2canvas(container, { backgroundColor: '#161b22', scale: 2 });
          document.body.removeChild(container);
          
          if (destination !== 'local') {
            const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'));
            if (blob) {
              await uploadToCloud(blob, chunks.length > 1 ? `${filename}_part${i + 1}.png` : `${filename}.png`);
            }
          } else {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = chunks.length > 1 ? `${filename}_part${i + 1}.png` : `${filename}.png`;
            link.click();
            await new Promise(r => setTimeout(r, 500));
          }
        }
      }

      setExporting(false);
      if (destination === 'dropbox') {
        alert('History securely saved to your Dropbox!');
      } else if (destination === 'gdrive') {
        alert('History securely saved to your Google Drive!');
      } else if (format !== 'COPY') {
        alert('Export complete!');
      }
    } catch (err: any) {
      console.error(err);
      alert(`Failed to export history: ${err.message || err}`);
      setExporting(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)' }}>Download</h1>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '24px'
      }}>
        <h2 style={{ fontSize: '16px', margin: '0 0 20px 0', color: 'var(--text-main)' }}>Export Format</h2>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {formats.map(f => {
            const isLocked = userPlan === 'free' && f.id !== 'PDF';
            return (
              <button
                key={f.id}
                onClick={() => {
                  if (isLocked) {
                    alert('Only PDF export is available on the free plan. Please upgrade to Pro/Premium to unlock other export formats.');
                    return;
                  }
                  setFormat(f.id);
                }}
                style={{
                  background: format === f.id ? 'var(--primary-bg)' : 'var(--bg-main)',
                  border: `1px solid ${format === f.id ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '12px', cursor: isLocked ? 'not-allowed' : 'pointer', width: '110px',
                  color: 'var(--text-main)', transition: 'all 0.2s', position: 'relative',
                  opacity: isLocked ? 0.6 : 1
                }}
              >
                {isLocked && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '14px' }}>
                    🔒
                  </div>
                )}
                <div style={{ 
                  width: '12px', height: '12px', borderRadius: '50%', 
                  border: format === f.id ? '4px solid var(--primary)' : '2px solid var(--text-muted)',
                  background: format === f.id ? 'white' : 'transparent',
                  marginBottom: '4px'
                }} />
                <div style={{ fontSize: '28px' }}>{f.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{f.label}</div>
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>Filename Format</label>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Choose how exported files are named.</div>
          <select 
            value={filenameFormat}
            onChange={(e) => setFilenameFormat(e.target.value)}
            style={{
              width: '100%', background: 'var(--icon-bg)', border: '1px solid var(--border)', color: 'var(--text-main)',
              padding: '12px 16px', borderRadius: '8px', fontSize: '14px', outline: 'none', marginBottom: '12px'
            }}
          >
            <option value="date">Rewrite History - Date (e.g. RewriteHistory_2026-06-23)</option>
            <option value="custom">Custom Title</option>
          </select>

          {filenameFormat === 'custom' && (
            <input 
              type="text" 
              placeholder="Enter custom filename..." 
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg-main)', border: '1px solid var(--primary)', color: 'var(--text-main)',
                padding: '12px 16px', borderRadius: '8px', fontSize: '14px', outline: 'none'
              }}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => handleExport('local')}
            disabled={exporting}
            style={{
              background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px',
              padding: '12px 16px', fontWeight: 600, cursor: exporting ? 'not-allowed' : 'pointer', fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '8px', opacity: exporting ? 0.7 : 1, flex: '1 1 200px', justifyContent: 'center'
            }}
          >
            {exporting ? 'Exporting...' : 'Export Local File'}
          </button>
          
          <button 
            onClick={() => {
              if (userPlan === 'free') {
                alert('Cloud backup is only available on paid plans. Please upgrade to Pro/Premium.');
                return;
              }
              handleExport('dropbox');
            }}
            disabled={exporting}
            style={{
              background: '#0061FE', color: 'white', border: 'none', borderRadius: '8px',
              padding: '12px 16px', fontWeight: 600, cursor: exporting ? 'not-allowed' : 'pointer', fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '8px', opacity: (exporting || userPlan === 'free') ? 0.6 : 1, flex: '1 1 200px', justifyContent: 'center'
            }}
          >
            {exporting ? 'Exporting...' : 'Save to Dropbox 📦'} {userPlan === 'free' && '🔒'}
          </button>

          <button 
            onClick={() => {
              if (userPlan === 'free') {
                alert('Cloud backup is only available on paid plans. Please upgrade to Pro/Premium.');
                return;
              }
              handleExport('gdrive');
            }}
            disabled={exporting}
            style={{
              background: '#ffffff', color: '#555', border: '1px solid #ccc', borderRadius: '8px',
              padding: '12px 16px', fontWeight: 600, cursor: exporting ? 'not-allowed' : 'pointer', fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '8px', opacity: (exporting || userPlan === 'free') ? 0.6 : 1, flex: '1 1 200px', justifyContent: 'center'
            }}
          >
            {exporting ? 'Exporting...' : 'Save to Google Drive ☁️'} {userPlan === 'free' && '🔒'}
          </button>
        </div>
      </div>
    </div>
  );
};
