import React, { useState } from 'react';

export const HelpFAQ: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do I rewrite text on a website?",
      a: "Select any text on a webpage. A floating '✨' button will appear. Click it, and you will see the rewrite popup. Choose your desired tone and the AI will rewrite it for you."
    },
    {
      q: "Which AI models are supported?",
      a: "We currently support OpenAI GPT, Google Gemini, Anthropic Claude, and Groq open-source models for lightning-fast rewrites."
    },
    {
      q: "Is my data secure?",
      a: "Yes. We only process the specific text you select for rewriting. Your data is not stored or used for training AI models."
    },
    {
      q: "What is the difference between Free and Pro plans?",
      a: "The Free plan gives you 10 rewrites per day. Pro plans give you hundreds or unlimited rewrites, Bulk Rewrite capabilities, and premium themes."
    },
    {
      q: "How do I activate my license key?",
      a: "Go to the 'Account & Usage' tab in this dashboard, enter your key in the license field at the bottom, and click 'Activate'."
    },
    {
      q: "Does this work on Google Docs or Notion?",
      a: "Yes, the extension can interact with text on most modern web applications including Google Docs, Notion, and Gmail."
    },
    {
      q: "Can I use my own API key?",
      a: "Currently, our subscription covers all API costs to ensure a smooth, zero-configuration experience for users. Custom API keys are coming soon."
    },
    {
      q: "How do I change the default rewrite tone?",
      a: "Navigate to the Settings tab on this dashboard and select your preferred default tone. It will be saved automatically."
    },
    {
      q: "Why doesn't the floating button appear sometimes?",
      a: "The button requires a minimum text selection length. Also, on some highly restricted sites (like Chrome Web Store), extensions are blocked by Google."
    },
    {
      q: "Can I copy the rewritten text without replacing the original?",
      a: "Yes, in the rewrite popup, there is an option to just copy the rewritten text to your clipboard without altering the original webpage text."
    },
    {
      q: "How do I cancel my subscription?",
      a: "You can cancel anytime through the billing portal linked in your original purchase email, or by contacting support."
    },
    {
      q: "What does 'Expand' tone do?",
      a: "The Expand tone takes your selected text and adds relevant details, context, and elaboration to make it more comprehensive."
    },
    {
      q: "Do you offer a student discount?",
      a: "Yes! We offer a discount for students and researchers. Please email us at support@example.com from your .edu address."
    },
    {
      q: "Is there a bulk rewrite option?",
      a: "Bulk rewrite is a Premium feature that allows you to rewrite entire paragraphs or documents at once through the side panel."
    },
    {
      q: "How do I report a bug?",
      a: "You can report bugs by emailing our support team using the button at the top of the 'Account & Usage' page."
    },
    {
      q: "Why does it say 'Quota Exceeded'?",
      a: "This means you have used all your rewrites for the day. Free users get 10 per day, resetting at midnight."
    }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)' }}>Help & FAQ</h1>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <div style={{ fontSize: '24px' }}>✉️</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-main)' }}>Support & Business Inquiries</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Reach out at: <a href="mailto:support@example.com" style={{ color: 'var(--primary)', textDecoration: 'none' }}>support@example.com</a>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>Frequently Asked Questions</h2>

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
