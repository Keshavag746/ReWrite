import React, { useState } from 'react';

export const HelpFAQ: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do I rewrite text on a website?",
      a: "Simply highlight or select any text on any webpage. A floating magic wand button ('✨') will automatically appear near your cursor. Clicking this icon opens the interactive rewrite popup, where you can select a rewrite tone (such as Improve, Grammar, Professional, Casual, Expand, or Shorten) to let the AI rewrite the content for you. You can also trigger the interface via the Command Palette shortcut (Ctrl+Shift+P on Windows/Linux or Cmd+Shift+P on macOS)."
    },
    {
      q: "Which AI models are supported?",
      a: "We currently support state-of-the-art LLMs including OpenAI's GPT (e.g., GPT-4o-mini), Google's Gemini, Anthropic's Claude, and Groq open-source models (such as Llama 3) for high-performance, lightning-fast text processing."
    },
    {
      q: "Is my data secure?",
      a: "Yes, privacy is a core priority. We only process the specific text you select for rewriting. The text is safely transmitted to our backend API to perform the request. We do not store your text log history long-term on our servers, nor do we share it with third parties or use it to train AI models. Additionally, the extension runs in a sandboxed environment to ensure your personal browsing history is protected."
    },
    {
      q: "What is the difference between Free and Pro plans?",
      a: "The Free plan provides 5 rewrites per day, restricted exclusively to the 'Improve' tone and 'PDF' download/export format. Dropbox and Google Drive integrations are also locked. Paid plans (Weekly, Monthly Pro, and Yearly Ultimate) unlock all 6 tones, all 6 download formats (PDF, Markdown, TXT, IMG, JSON, and Clipboard Copy), and cloud backup integrations for a premium, restriction-free experience."
    },
    {
      q: "Why are certain rewrite tones, export formats, and cloud backups locked on the Free plan?",
      a: "Running state-of-the-art AI models (such as GPT-4o-mini, Gemini, and Claude) and managing cloud synchronization requires substantial server infrastructure, compute power, and direct API costs for every action. To make our service sustainable while still offering a fully functional free option, the Free plan covers basic requirements (5 daily rewrites with the 'Improve' tone and local PDF generation). The subscription plans subsidize the costs of premium tones (Grammar, Professional, Casual, Expand, Shorten), cloud connectors (Dropbox, Google Drive), and multiple format exports (Markdown, TXT, IMG, JSON, COPY), ensuring we can support high performance, active updates, and strict privacy without ads."
    },
    {
      q: "How do I activate my license key?",
      a: "After completing your subscription purchase, paste your license key in the key validation field at the bottom of the 'Account & Usage' page on the dashboard and click 'Activate License'. Your account plan details will instantly update in your browser storage."
    },
    {
      q: "Does this work on Google Docs or Notion?",
      a: "Yes, the extension is fully compatible with popular editors and rich text portals like Google Docs, Notion, Gmail, LinkedIn, Slack web, and Twitter/X. If the floating button is disabled on a custom application, you can use the Command Palette keyboard shortcut to rewrite your selection."
    },
    {
      q: "Can I use my own API key?",
      a: "To provide a seamless, plug-and-play experience, all API usage costs are fully covered under your subscription plan. Currently, you do not need to configure your own API keys. However, we plan to support custom user API configurations in a future developer-oriented update."
    },
    {
      q: "How do I change the default rewrite tone?",
      a: "You can set your default rewrite tone in the Settings tab of this options panel. Saving your preference will automatically default to that tone when clicking the magic wand icon, though you can still switch tones in the popup when needed."
    },
    {
      q: "Why doesn't the floating button appear sometimes?",
      a: "The magic wand button requires a minimum selection length of text to prevent accidental overlays. Furthermore, standard browser security policies strictly block content injections on certain privileged pages, such as the Chrome Web Store (chrome.google.com) and internal configuration pages (chrome://)."
    },
    {
      q: "Can I copy the rewritten text without replacing the original?",
      a: "Yes, inside the floating rewrite popup, you can click the 'Copy' icon. This copies the newly rewritten version straight to your clipboard, allowing you to paste it anywhere you like without replacing or affecting the original content on the webpage."
    },
    {
      q: "How do I cancel my subscription?",
      a: "You can manage or cancel your subscription at any time by clicking the customer billing portal link provided in your purchase confirmation email. If you cannot locate the email, contact us at keshoraai@gmail.com and we will assist you."
    },
    {
      q: "What does 'Expand' tone do?",
      a: "The 'Expand' tone uses generative intelligence to build out and elaborate on your selected text, adding rich details, context, and proper grammatical structure to short thoughts, bullet points, or phrases while keeping the original intent intact."
    },
    {
      q: "Do you offer a student discount?",
      a: "Yes, we support students, educators, and academic researchers. We offer a 30% discount across all paid subscription plans. Email us at keshoraai@gmail.com from your official school or university email address (.edu or academic domain) to request your discount code."
    },
    {
      q: "Is there a bulk rewrite option?",
      a: "Yes, premium tier users can make use of bulk rewriting. Instead of selecting individual segments, you can open the extension side panel and paste entire documents or paragraphs to modify them in one go."
    },
    {
      q: "How do I report a bug?",
      a: "You can email bug reports directly to our support team at keshoraai@gmail.com. Clicking the help widget in the 'Account & Usage' tab will pre-populate a support template containing extension details to help us diagnose the issue."
    },
    {
      q: "Why does it say 'Quota Exceeded'?",
      a: "A 'Quota Exceeded' warning means you have consumed your allotted usage for your plan's active cycle: Free users are limited to 5 daily rewrites; Weekly users get 140 rewrites; Monthly Pro users get 600 rewrites; and Yearly Ultimate users receive 9,000 rewrites. Quotas reset automatically based on the cycle (daily at midnight local time, or on rolling weekly/monthly/yearly boundaries). You can upgrade to a higher tier on the 'Account & Usage' page to resume service immediately."
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
            Reach out at: <a href="mailto:keshoraai@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none' }}>keshoraai@gmail.com</a>
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
