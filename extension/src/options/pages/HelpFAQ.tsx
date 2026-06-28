import React, { useState } from 'react';

export const HelpFAQ: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = Array.from({ length: 17 }, (_, idx) => ({
    q: chrome.i18n.getMessage(`faq_q_${idx}`),
    a: chrome.i18n.getMessage(`faq_a_${idx}`)
  }));

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)' }}>{chrome.i18n.getMessage('sidebarHelpFAQ')}</h1>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <div style={{ fontSize: '24px' }}>✉️</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-main)' }}>{chrome.i18n.getMessage('supportInquiriesLabel')}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {chrome.i18n.getMessage('supportReachOutText')} <a href="mailto:keshoraai@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none' }}>keshoraai@gmail.com</a>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>{chrome.i18n.getMessage('faqTitle')}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {faqs.map((faq, index) => (
          <div key={index} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden'
          }}>
            <button 
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px', background: 'transparent', border: 'none', color: 'var(--text-main)',
                fontSize: '15px', fontWeight: 600, cursor: 'pointer', textAlign: 'left'
              }}
            >
              {faq.q}
              <span style={{ color: 'var(--text-muted)' }}>{openFaq === index ? '▲' : '▼'}</span>
            </button>
            
            {openFaq === index && (
              <div style={{ padding: '0 20px 20px 20px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
