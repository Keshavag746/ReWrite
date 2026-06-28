const fs = require('fs');
const path = require('path');

const SUPPORTED_LOCALES = [
  "am", "ar", "az", "bg", "bn", "cs", "da", "de", "el", "en", 
  "es", "fa", "fi", "fr", "gu", "ha", "he", "hi", "hr", "hu", 
  "id", "ig", "it", "ja", "jv", "kk", "km", "kn", "ko", "lt", 
  "ml", "mr", "my", "ne", "nl", "no", "pa", "pl", "ps", "pt", 
  "ro", "ru", "sd", "si", "sk", "sl", "sv", "sw", "ta", "te", 
  "th", "tl", "tr", "uk", "ur", "uz", "vi", "yo", "zh_CN", "zh_TW", 
  "zu"
];

const UI_STRINGS = {
  // Manifest & Extension General
  "appName": "Rewrite Anywhere - AI Text Rewriter",
  "appDesc": "Highlight text anywhere. Rewrite instantly with AI.",
  "commandDesc": "Open AI Rewrite command palette",
  
  // Context Menus
  "contextMenuParent": "AI Rewrite →",
  "contextMenu_improve": "✨ Improve Writing",
  "contextMenu_grammar": "✅ Fix Grammar",
  "contextMenu_professional": "💼 Make Professional",
  "contextMenu_friendly": "😊 Make Friendly",
  "contextMenu_formal": "🎩 Make Formal",
  "contextMenu_casual": "👋 Make Casual",
  "contextMenu_persuasive": "🎯 Make Persuasive",
  "contextMenu_confident": "💪 Make Confident",
  "contextMenu_humanize": "🤖→👤 Humanize",
  "contextMenu_custom": "⚡ Custom Prompt...",

  // Rewrite Modes
  "mode_improve": "✨ Improve",
  "mode_grammar": "✅ Grammar",
  "mode_professional": "💼 Professional",
  "mode_friendly": "😊 Friendly",
  "mode_formal": "🎩 Formal",
  "mode_casual": "👋 Casual",
  "mode_persuasive": "🎯 Persuasive",
  "mode_confident": "💪 Confident",
  "mode_shorten": "✂️ Shorten",
  "mode_expand": "📖 Expand",
  "mode_simplify": "🔤 Simplify",
  "mode_humanize": "🤖 Humanize",
  "mode_custom": "⚡ Custom",

  // Popup & App General
  "loading": "Loading...",
  "rewriteTextAnywhere": "Rewrite text anywhere",
  "signInText": "Sign in with Google to start rewriting text on any website with AI.",
  "signingIn": "Signing in...",
  "signInBtn": "🔐 Sign in with Google",
  "planPro": "⚡ Pro",
  "planFree": "Free",
  "dailyUsage": "Daily Usage",
  "unlimited": "(unlimited)",
  "quickTip": "💡 Select text on any page → click the ✨ button to rewrite. Or press Ctrl+Shift+K",
  "btnOpenHistorySettings": "📋 Open History & Settings",
  "btnSignOut": "Sign Out",
  "loginFailed": "Login failed",
  "rewriteFailed": "Rewrite failed",
  "underConstruction": "This section is currently under construction.",
  "loginRequiredSettings": "Please sign in to view settings.",

  // Options Sidebar
  "sidebarAccountUsage": "Account & Usage",
  "sidebarRewriteHistory": "Rewrite History",
  "sidebarSettings": "Settings",
  "sidebarDownload": "Download",
  "sidebarHelpFAQ": "Help & FAQ",
  "sidebarDashboardTitle": "AI Rewrite Dashboard",

  // Options: Settings Page
  "generalConfig": "General Configuration",
  "interfaceTheme": "Interface Theme",
  "themeDark": "Dark Mode",
  "themeLight": "Light Mode",
  "defaultToneLabel": "Default Rewrite Tone",

  // Options: History Page
  "btnClearAllHistory": "🗑️ Clear All History",
  "noRewritesTitle": "No rewrites yet",
  "noRewritesDesc": "Highlight text on any page and click ✨ to get started. Your history will appear here.",
  "deleteConfirm": "Are you sure you want to delete this rewrite history item?",
  "clearAllConfirm": "Are you sure you want to permanently delete your entire rewrite history? This cannot be undone.",
  "failedToDelete": "Failed to delete item: ",
  "failedToClear": "Failed to clear history: ",
  "originalTextLabel": "Original Text",
  "rewrittenTextLabel": "Rewritten Text",
  "btnDelete": "🗑️ Delete",
  "btnCopyRewritten": "📋 Copy Rewritten",
  "copiedStatus": "✓ Copied!",
  "btnLoadOlder": "Load older rewrites",

  // Options: Help & FAQ Page
  "supportInquiriesLabel": "Support & Business Inquiries",
  "supportReachOutText": "Reach out at: ",
  "faqTitle": "Frequently Asked Questions",

  // Options: Account & Usage Page
  "billingHelp": "For help or to report a bug",
  "billingEmail": "Email keshoraai@gmail.com",
  "dailyFreeLimit": "Daily Free Limit",
  "freeTierDesc": "Free tier: 5 rewrites/day. Resets daily at midnight.",
  "noLimitsTitle": "Rewrite text anywhere without limits.",
  "noLimitsDesc": "Batch rewrite all your content. Sync to the cloud. No restrictions.",
  "earlyAdopterOffer": "🎁 Early Adopter Offer: Next price increase at 500 Premium users. Lock in this rate for life!",
  "marketUS": "🇺🇸 US Market ($)",
  "marketIN": "🇮🇳 Indian Market (₹)",
  "billingMaintenanceAlert": "US Dollar payments are currently under maintenance. Please switch to the Indian Market (₹) plan or contact us at keshoraai@gmail.com for assistance.",
  
  "weeklyPlanName": "Weekly",
  "usdWeeklySub": "(Just 57¢ / day)",
  "monthlyPlanName": "Monthly ⭐",
  "usdMonthlySub": "(Just 33¢ / day)",
  "yearlyPlanName": "Yearly 💎",
  "usdYearlySub": "(Just 21¢ / day)",
  "inrWeeklySub": "(Just ₹21 / day)",
  "inrMonthlySub": "(Just ₹13 / day)",
  "inrYearlySub": "(Just ₹8 / day)",
  "pricingPeriodWeek": "/ week",
  "pricingPeriodMonth": "/ month",
  "pricingPeriodYear": "/ year",
  
  "goodForOccasional": "Good for occasional use",
  "mostUsersChoose": "Most users choose this plan",
  "bestValuePower": "Best value for power users",
  "mostPopularBadge": "MOST POPULAR",
  "bestValueBadge": "BEST VALUE - 2 MONTHS FREE",
  
  "pricingRating": "⭐ 5.0 Rating • 🔒 Secure Payments • ✔️ Cancel anytime",
  "pricingStudent": "Are you a student or researcher who can't afford a subscription? Please email keshoraai@gmail.com",
  "alreadyLicenseKey": "Already have a license key?",
  "licensePlaceholder": "Enter license key...",
  "btnActivate": "Activate",

  // Pricing Plan Features
  "feature_rewrites_weekly": "140 Rewrites per week",
  "feature_bulk_rewrite": "Unlock Bulk Rewrite",
  "feature_settings_access": "Premium Settings Access",
  "feature_cloud_sync": "GDrive, Dropbox Sync",
  "feature_themes": "Premium Themes",
  "feature_folders": "Smart Folder Organization",
  "feature_ad_free": "Ad-free Experience",
  "feature_rewrites_monthly": "600 Rewrites per month",
  "feature_rewrites_yearly": "9,000 Rewrites per year",
  "feature_discount": "50% off other extensions",
  "feature_priority_support": "Priority Email Support",

  // Options: Download History Page
  "exportFormat": "Export Format",
  "freePlanLimitAlert": "Only PDF export is available on the free plan. Please upgrade to Pro/Premium to unlock other export formats.",
  "filenameFormatLabel": "Filename Format",
  "filenameFormatDesc": "Choose how exported files are named.",
  "optionDate": "Rewrite History - Date (e.g. RewriteHistory_2026-06-23)",
  "optionCustom": "Custom Title",
  "customFilenamePlaceholder": "Enter custom filename...",
  "btnExportLocal": "Export Local File",
  "btnSaveDropbox": "Save to Dropbox 📦",
  "btnSaveGDrive": "Save to Google Drive ☁️",
  "exportingStatus": "Exporting...",
  
  "cloudBackupLockedAlert": "Cloud backup is only available on paid plans. Please upgrade to Pro/Premium.",
  "dropboxAuthCancelled": "Dropbox authentication cancelled.",
  "dropboxTokenFailed": "Failed to obtain Dropbox access token.",
  "gdriveAuthFailed": "Google Drive authentication failed.",
  "gdriveUploadFailed": "Google Drive upload failed: ",
  "dropboxUploadFailed": "Dropbox API Error ",
  "noHistoryToExport": "No history found to export.",
  
  "copySuccessAlert": "History beautifully formatted and copied to clipboard!",
  "dropboxSuccessAlert": "History securely saved to your Dropbox!",
  "gdriveSuccessAlert": "History securely saved to your Google Drive!",
  "exportCompleteAlert": "Export complete!",

  // Floating Button & Popup UI Injected
  "floatingButtonAria": "Rewrite with AI",
  "popupTitleLabel": "AI Rewrite",
  "popupCloseLabel": "Close",
  "popupOriginalTextLabel": "Original text",
  "popupPlaceholder": "Select a mode to rewrite...",
  
  "btnReplace": "Replace",
  "btnCopy": "Copy",
  "btnCopied": "✓ Copied",
  "btnRetry": "↺ Retry",
  "btnSave": "Save",
  
  "freePlanModesAlert": "Only the \"Improve\" mode is available on the free plan. Please upgrade to Pro to unlock all 13 modes.",
  "freePlanModesPopupAlert": "Only the \"Improve\" mode is available on the free plan. Please upgrade to Pro/Premium to unlock all 13 rewrite modes.",

  // Command Palette
  "commandPaletteTitle": "⚡ AI Rewrite Command Palette",
  "commandPaletteFreeWarning": "⚠️ Free Plan (Custom prompts locked)",
  "commandPalettePlaceholderFree": "Custom prompt is locked on Free Plan...",
  "commandPalettePlaceholderPro": "e.g. Rewrite for LinkedIn, Make this persuasive...",
  "commandPaletteLockedAlert": "Only the \"Improve\" mode is available on the free plan. Please upgrade to Pro/Premium to unlock all features.",
  "commandPaletteLockedModesAlert": "Only the \"Improve\" mode is available on the free plan. Please upgrade to Pro/Premium to unlock all modes.",

  // Sidepanel
  "sidepanelHistoryTab": "📋 History",
  "sidepanelSettingsTab": "⚙️ Settings",
  "sidepanelNoHistory": "No rewrites yet.",
  "sidepanelHighlightText": "Highlight text on any page and click ✨ to get started.",
  "sidepanelOriginal": "Original:",
  "sidepanelRewritten": "→ Rewritten:",
  "sidepanelLoadMore": "Load more",
  "sidepanelAccount": "Account",
  "sidepanelRewritesToday": "Rewrites today",
  "sidepanelResets": "Resets ",
  "sidepanelEngineActive": "Active ✓",
  "sidepanelEngineTitle": "AI Engine",
  "sidepanelEngineLabel": "✨ AI Rewrite Engine"
};

const FAQ_STRINGS = {
  "faq_q_0": "How do I rewrite text on a website?",
  "faq_a_0": "Simply highlight or select any text on any webpage. A floating magic wand button ('✨') will automatically appear near your cursor. Clicking this icon opens the interactive rewrite popup, where you can select a rewrite tone (such as Improve, Grammar, Professional, Casual, Expand, or Shorten) to let the AI rewrite the content for you. You can also trigger the interface via the Command Palette shortcut (Ctrl+Shift+P on Windows/Linux or Cmd+Shift+P on macOS).",
  
  "faq_q_1": "Which AI models are supported?",
  "faq_a_1": "We currently support state-of-the-art LLMs including OpenAI's GPT (e.g., GPT-4o-mini), Google's Gemini, Anthropic's Claude, and Groq open-source models (such as Llama 3) for high-performance, lightning-fast text processing.",
  
  "faq_q_2": "Is my data secure?",
  "faq_a_2": "Yes, privacy is a core priority. We only process the specific text you select for rewriting. The text is safely transmitted to our backend API to perform the request. We do not store your text log history long-term on our servers, nor do we share it with third parties or use it to train AI models. Additionally, the extension runs in a sandboxed environment to ensure your personal browsing history is protected.",
  
  "faq_q_3": "What is the difference between Free and Pro plans?",
  "faq_a_3": "The Free plan provides 5 rewrites per day, restricted exclusively to the 'Improve' tone and 'PDF' download/export format. Dropbox and Google Drive integrations are also locked. Paid plans (Weekly, Monthly Pro, and Yearly Ultimate) unlock all 6 tones, all 6 download formats (PDF, Markdown, TXT, IMG, JSON, and Clipboard Copy), and cloud backup integrations for a premium, restriction-free experience.",
  
  "faq_q_4": "Why are certain rewrite tones, export formats, and cloud backups locked on the Free plan?",
  "faq_a_4": "Running state-of-the-art AI models (such as GPT-4o-mini, Gemini, and Claude) and managing cloud synchronization requires substantial server infrastructure, compute power, and direct API costs for every action. To make our service sustainable while still offering a fully functional free option, the Free plan covers basic requirements (5 daily rewrites with the 'Improve' tone and local PDF generation). The subscription plans subsidize the costs of premium tones (Grammar, Professional, Casual, Expand, Shorten), cloud connectors (Dropbox, Google Drive), and multiple format exports (Markdown, TXT, IMG, JSON, COPY), ensuring we can support high performance, active updates, and strict privacy without ads.",
  
  "faq_q_5": "How do I activate my license key?",
  "faq_a_5": "After completing your subscription purchase, paste your license key in the key validation field at the bottom of the 'Account & Usage' page on the dashboard and click 'Activate License'. Your account plan details will instantly update in your browser storage.",
  
  "faq_q_6": "Does this work on Google Docs or Notion?",
  "faq_a_6": "Yes, the extension is fully compatible with popular editors and rich text portals like Google Docs, Notion, Gmail, LinkedIn, Slack web, and Twitter/X. If the floating button is disabled on a custom application, you can use the Command Palette keyboard shortcut to rewrite your selection.",
  
  "faq_q_7": "Can I use my own API key?",
  "faq_a_7": "To provide a seamless, plug-and-play experience, all API usage costs are fully covered under your subscription plan. Currently, you do not need to configure your own API keys. However, we plan to support custom user API configurations in a future developer-oriented update.",
  
  "faq_q_8": "How do I change the default rewrite tone?",
  "faq_a_8": "You can set your default rewrite tone in the Settings tab of this options panel. Saving your preference will automatically default to that tone when clicking the magic wand icon, though you can still switch tones in the popup when needed.",
  
  "faq_q_9": "Why doesn't the floating button appear sometimes?",
  "faq_a_9": "The magic wand button requires a minimum selection length of text to prevent accidental overlays. Furthermore, standard browser security policies strictly block content injections on certain privileged pages, such as the Chrome Web Store (chrome.google.com) and internal configuration pages (chrome://).",
  
  "faq_q_10": "Can I copy the rewritten text without replacing the original?",
  "faq_a_10": "Yes, inside the floating rewrite popup, you can click the 'Copy' icon. This copies the newly rewritten version straight to your clipboard, allowing you to paste it anywhere you like without replacing or affecting the original content on the webpage.",
  
  "faq_q_11": "How do I cancel my subscription?",
  "faq_a_11": "You can manage or cancel your subscription at any time by clicking the customer billing portal link provided in your purchase confirmation email. If you cannot locate the email, contact us at keshoraai@gmail.com and we will assist you.",
  
  "faq_q_12": "What does 'Expand' tone do?",
  "faq_a_12": "The 'Expand' tone uses generative intelligence to build out and elaborate on your selected text, adding rich details, context, and proper grammatical structure to short thoughts, bullet points, or phrases while keeping the original intent intact.",
  
  "faq_q_13": "Do you offer a student discount?",
  "faq_a_13": "Yes, we support students, educators, and academic researchers. We offer a 30% discount across all paid subscription plans. Email us at keshoraai@gmail.com from your official school or university email address (.edu or academic domain) to request your discount code.",
  
  "faq_q_14": "Is there a bulk rewrite option?",
  "faq_a_14": "Yes, premium tier users can make use of bulk rewriting. Instead of selecting individual segments, you can open the extension side panel and paste entire documents or paragraphs to modify them in one go.",
  
  "faq_q_15": "How do I report a bug?",
  "faq_a_15": "You can email bug reports directly to our support team at keshoraai@gmail.com. Clicking the help widget in the 'Account & Usage' tab will pre-populate a support template containing extension details to help us diagnose the issue.",
  
  "faq_q_16": "Why does it say 'Quota Exceeded'?",
  "faq_a_16": "A 'Quota Exceeded' warning means you have consumed your allotted usage for your plan's active cycle: Free users are limited to 5 daily rewrites; Weekly users get 140 rewrites; Monthly Pro users get 600 rewrites; and Yearly Ultimate users receive 9,000 rewrites. Quotas reset automatically based on the cycle (daily at midnight local time, or on rolling weekly/monthly/yearly boundaries). You can upgrade to a higher tier on the 'Account & Usage' page to resume service immediately."
};

// Combine all English messages
const masterEnMessages = { ...UI_STRINGS, ...FAQ_STRINGS };

const ENGLISH_LONG_DESC = `✨ Rewrite text anywhere on the web instantly using state-of-the-art AI.

Tired of copying and pasting text into chat windows to fix your writing? With AI Rewrite Anywhere, you can highlight or select any text on any website (Google Docs, Notion, Gmail, LinkedIn, Slack, Twitter/X, and more) and rewrite it instantly.

Powered by a smart AI fallback chain using top-tier large language models (including OpenAI GPT, Google Gemini, Anthropic Claude, and Groq open-source Llama), the extension ensures maximum uptime and lightning-fast responses by automatically routing requests to the next available provider if one encounters a service interruption.

🚀 KEY FEATURES:
- 🖱️ Highlight & Rewrite: Simply highlight text on any webpage. A floating magic wand button appears near your cursor. Click it to rewrite instantly.
- 🖱️ Context Menu Integration: Right-click any selection to access 13 distinct rewrite modes directly from the browser's context menu.
- ⌨️ Command Palette (Ctrl+Shift+K): Open a fast, keyboard-centric interface to type custom prompts or trigger quick presets without touching the mouse.
- 📋 Full Rewrite History & Settings: Access a beautiful dashboard sidepanel to review past rewrites, export logs in multiple formats, and configure preferences.
- 🔄 Seamless AI Fallback: Enjoy uninterrupted service. If the primary model fails, the extension automatically switches to the next available model transparently.
- 🔐 Secure Google Sign-In: Quick, protected authentication that syncs your settings across devices safely.

🎯 13 DYNAMIC REWRITE MODES:
1. Improve: Polish writing structure and vocabulary automatically.
2. Grammar: Correct spelling, punctuation, and syntax errors.
3. Professional: Elevate your language for professional correspondence.
4. Friendly: Add warmth and approachability to your messages.
5. Formal: Adjust phrasing for official documents and business letters.
6. Casual: Create relaxed, conversational text for social settings.
7. Persuasive: Structure ideas to convince, pitch, or market effectively.
8. Confident: Project certainty, authority, and strong conviction.
9. Shorten: Condense lengthy paragraphs into concise highlights.
10. Expand: Elocute and build on short bullet points or phrases.
11. Simplify: Translate jargon or complex thoughts into clear, readable language.
12. Humanize: Restructure robotic AI drafts to read naturally.
13. Custom Prompt: Type exactly what you want the AI to do with the selection.

📂 PREMIUM EXPORT FORMATS:
Export your rewrite history locally or sync directly to cloud services:
- PDF (Free & Premium)
- Markdown (MD)
- TXT
- Image (IMG)
- JSON
- Clipboard Copy
- Cloud Integration: Save directly to Dropbox or Google Drive.

🔒 PRIVACY & SECURITY BY DESIGN:
Privacy is our primary commitment. We only process the specific text you select for active rewriting. Your selection is safely transmitted through SSL encryption to our backend API to perform the request and is not stored long-term on our servers. Your personal browsing history is completely protected.

📧 CONTACT & SUPPORT:
Have questions, suggestions, or bug reports? Contact us directly at keshoraai@gmail.com. We are committed to regular updates and feature requests!`;

// Helpers to handle strings with placeholders that shouldn't be garbled by Google Translate
function replacePlaceholders(text) {
  const replacements = [];
  let newText = text;
  
  // Protect email
  newText = newText.replace(/keshoraai@gmail.com/gi, (match) => {
    replacements.push({ placeholder: `__EMAIL_VAR_${replacements.length}__`, original: match });
    return replacements[replacements.length - 1].placeholder;
  });

  // Protect shortcut keys
  newText = newText.replace(/Ctrl\+Shift\+K/g, (match) => {
    replacements.push({ placeholder: `__SHORTCUT_VAR_${replacements.length}__`, original: match });
    return replacements[replacements.length - 1].placeholder;
  });

  newText = newText.replace(/Ctrl\+Shift\+P/g, (match) => {
    replacements.push({ placeholder: `__SHORTCUT_VAR_${replacements.length}__`, original: match });
    return replacements[replacements.length - 1].placeholder;
  });

  newText = newText.replace(/Cmd\+Shift\+P/g, (match) => {
    replacements.push({ placeholder: `__SHORTCUT_VAR_${replacements.length}__`, original: match });
    return replacements[replacements.length - 1].placeholder;
  });

  // Protect links
  newText = newText.replace(/https:\/\/\S+/g, (match) => {
    replacements.push({ placeholder: `__LINK_VAR_${replacements.length}__`, original: match });
    return replacements[replacements.length - 1].placeholder;
  });

  return { text: newText, replacements };
}

function restorePlaceholders(text, replacements) {
  let restored = text;
  // Restore in reverse order to prevent nested placeholder matching issues
  for (let i = replacements.length - 1; i >= 0; i--) {
    const rep = replacements[i];
    // Google Translate may alter capitalization or spaces in placeholder tags
    const escapedPlaceholder = rep.placeholder.replace(/_/g, '\\s*_?\\s*');
    const regex = new RegExp(escapedPlaceholder, 'gi');
    restored = restored.replace(regex, rep.original);
  }
  return restored;
}

// Function to call Google Translate public endpoint
async function translateText(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `q=${encodeURIComponent(text)}`
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result && result[0]) {
        let translatedText = '';
        for (const item of result[0]) {
          if (item[0]) {
            translatedText += item[0];
          }
        }
        return translatedText;
      }
    }
  } catch (postErr) {
    console.warn(`[Warning] POST translation failed: ${postErr.message}. Trying GET fallback...`);
  }

  // Fallback to GET method (for smaller chunks or if POST fails/is blocked with 405)
  const getUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(getUrl);
  if (!response.ok) {
    throw new Error(`Translate API error (GET): ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  if (!result || !result[0]) {
    throw new Error(`Invalid translate response format`);
  }

  let translatedText = '';
  for (const item of result[0]) {
    if (item[0]) {
      translatedText += item[0];
    }
  }
  return translatedText;
}

async function translateAllStrings(targetLang) {
  // 1. Prepare texts with replaced placeholders
  const keys = Object.keys(masterEnMessages);
  const values = keys.map(k => masterEnMessages[k]);
  
  // Also append the long description to translate it in the same run
  const allTexts = [...values, ENGLISH_LONG_DESC];
  
  const preprocessed = allTexts.map(t => replacePlaceholders(t));
  const preprocessedTexts = preprocessed.map(p => p.text);

  console.log(`Translating ${preprocessedTexts.length} items to "${targetLang}"...`);

  // Batch join with delimiter
  const DELIMITER = "\n\n@@@\n\n";
  const joinedText = preprocessedTexts.join(DELIMITER);
  
  let translatedJoined = "";
  let retry = 3;
  while (retry > 0) {
    try {
      translatedJoined = await translateText(joinedText, targetLang);
      break;
    } catch (err) {
      retry--;
      console.warn(`Retry remaining: ${retry}. Error: ${err.message}`);
      if (retry === 0) throw err;
      const waitTime = (4 - retry) * 6000;
      await new Promise(r => setTimeout(r, waitTime));
    }
  }

  // Split and restore
  // Split using @@@ allowing spaces or lowercase changes
  const splitPattern = /\s*@@@\s*/i;
  let translatedParts = translatedJoined.split(splitPattern);
  
  // Clean parts
  translatedParts = translatedParts.map(p => p.trim());

  // Verification of split length
  if (translatedParts.length !== allTexts.length) {
    console.warn(`[Warning] Part length mismatch for ${targetLang}: expected ${allTexts.length}, got ${translatedParts.length}. Falling back to chunked/single translations.`);
    translatedParts = [];
    for (let i = 0; i < preprocessedTexts.length; i++) {
      const textItem = preprocessedTexts[i];
      let trans = "";
      let retryItem = 3;
      while (retryItem > 0) {
        try {
          trans = await translateText(textItem, targetLang);
          break;
        } catch (e) {
          retryItem--;
          if (retryItem === 0) throw e;
          const itemWaitTime = (4 - retryItem) * 4000;
          await new Promise(r => setTimeout(r, itemWaitTime));
        }
      }
      translatedParts.push(trans.trim());
      // Slight delay between calls to prevent rate limits
      await new Promise(r => setTimeout(r, 100));
    }
  }

  // Restore placeholders for all parts
  const restoredParts = translatedParts.map((t, idx) => restorePlaceholders(t, preprocessed[idx].replacements));

  const longDescTranslated = restoredParts[restoredParts.length - 1];
  
  // Reconstruct locale messages dictionary
  const localizedMessages = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    localizedMessages[key] = {
      message: restoredParts[i],
      description: `Locale key: ${key}`
    };
  }

  return {
    messages: localizedMessages,
    longDescription: longDescTranslated
  };
}

async function run() {
  const localesDir = path.join(__dirname, '_locales');
  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir);
  }

  const allDescriptions = {};

  // First, write English manually (to ensure clean templates and zero API drift)
  console.log("Writing base 'en' locale files...");
  const enDir = path.join(localesDir, 'en');
  if (!fs.existsSync(enDir)) fs.mkdirSync(enDir);
  
  const enMessagesFormatted = {};
  for (const k of Object.keys(masterEnMessages)) {
    enMessagesFormatted[k] = {
      message: masterEnMessages[k],
      description: `Locale key: ${k}`
    };
  }
  fs.writeFileSync(
    path.join(enDir, 'messages.json'),
    JSON.stringify(enMessagesFormatted, null, 2),
    'utf8'
  );
  allDescriptions['en'] = ENGLISH_LONG_DESC;

  // Now loop through all other locales
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === 'en') continue;

    const localeDir = path.join(localesDir, locale);
    const messagesPath = path.join(localeDir, 'messages.json');
    const descPath = path.join(localeDir, 'webstore_listing_desc.txt');

    // Robust cache system: skip translation if output files already exist and contain all keys
    if (fs.existsSync(messagesPath) && fs.existsSync(descPath)) {
      try {
        const existingMessages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
        const existingDesc = fs.readFileSync(descPath, 'utf8');
        
        const hasAllKeys = Object.keys(masterEnMessages).every(k => existingMessages[k] !== undefined);
        if (hasAllKeys) {
          allDescriptions[locale] = existingDesc;
          console.log(`Skipping already translated locale (cached): ${locale}`);
          continue;
        }
      } catch (e) {
        // Fall through to re-translate if there's a file error
      }
    }

    try {
      // Map regional code adjustments
      let targetLang = locale;
      // Google translate maps zh_CN -> zh-CN, zh_TW -> zh-TW
      if (locale === 'zh_CN') targetLang = 'zh-CN';
      if (locale === 'zh_TW') targetLang = 'zh-TW';

      const result = await translateAllStrings(targetLang);
      
      // Save messages.json
      if (!fs.existsSync(localeDir)) {
        fs.mkdirSync(localeDir);
      }
      
      fs.writeFileSync(
        messagesPath,
        JSON.stringify(result.messages, null, 2),
        'utf8'
      );

      fs.writeFileSync(
        descPath,
        result.longDescription,
        'utf8'
      );
      
      allDescriptions[locale] = result.longDescription;
      console.log(`Successfully completed and wrote messages.json for locale: ${locale}`);

      // Small throttling delay to be a good citizen
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.error(`[Error] Failed to translate locale "${locale}":`, err);
      process.exit(1);
    }
  }

  console.log("All locale messages.json written successfully.");
  console.log("Generating cws_auto_filler.js script...");

  // Generate cws_auto_filler.js contents
  const autoFillerScript = `/**
 * Chrome Web Store Listing Description Auto-Filler
 * Pasted in the Chrome Developer Dashboard console to populate descriptions for all locales.
 */
(function() {
  const DESCRIPTIONS = ${JSON.stringify(allDescriptions, null, 2)};

  // UI Setup complying with Trusted Types security
  const policy = window.trustedTypes ? window.trustedTypes.createPolicy('cws-policy', {
    createHTML: (string) => string
  }) : { createHTML: (s) => s };

  // Create UI elements
  const panel = document.createElement('div');
  panel.style.position = 'fixed';
  panel.style.bottom = '20px';
  panel.style.right = '20px';
  panel.style.zIndex = '999999';
  panel.style.background = '#1A1A1E';
  panel.style.border = '2px solid #7C6EF8';
  panel.style.borderRadius = '12px';
  panel.style.padding = '16px';
  panel.style.color = '#F0F0F2';
  panel.style.fontFamily = 'system-ui, sans-serif';
  panel.style.boxShadow = '0 8px 30px rgba(0,0,0,0.5)';
  panel.style.width = '300px';

  const title = document.createElement('h3');
  title.style.margin = '0 0 12px 0';
  title.style.fontSize = '14px';
  title.style.color = '#7C6EF8';
  title.textContent = '✨ AI Rewrite CWS Auto-Filler';
  panel.appendChild(title);

  const status = document.createElement('div');
  status.style.fontSize = '12px';
  status.style.marginBottom = '12px';
  status.style.color = '#8B8B9A';
  status.textContent = 'Ready to fill translations.';
  panel.appendChild(status);

  const select = document.createElement('select');
  select.style.width = '100%';
  select.style.padding = '8px';
  select.style.marginBottom = '12px';
  select.style.background = '#0F0F10';
  select.style.color = '#F0F0F2';
  select.style.border = '1px solid #3A3A45';
  select.style.borderRadius = '6px';

  Object.keys(DESCRIPTIONS).forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc;
    opt.textContent = \`Locale: \${loc}\`;
    select.appendChild(opt);
  });
  panel.appendChild(select);

  // Set individual focused box filling helper
  const fillFocusedBtn = document.createElement('button');
  fillFocusedBtn.style.width = '100%';
  fillFocusedBtn.style.padding = '10px';
  fillFocusedBtn.style.marginBottom = '8px';
  fillFocusedBtn.style.background = '#2A2A32';
  fillFocusedBtn.style.border = '1px solid #3A3A45';
  fillFocusedBtn.style.color = '#F0F0F2';
  fillFocusedBtn.style.fontWeight = 'bold';
  fillFocusedBtn.style.borderRadius = '6px';
  fillFocusedBtn.style.cursor = 'pointer';
  fillFocusedBtn.textContent = '✏️ Fill Focused Textarea';
  fillFocusedBtn.onclick = () => {
    const loc = select.value;
    const text = DESCRIPTIONS[loc];
    const target = document.activeElement;
    if (target && target.tagName === 'TEXTAREA') {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      setter.call(target, text);
      target.dispatchEvent(new Event('input', { bubbles: true }));
      status.textContent = \`Filled focused box with: \${loc}\`;
    } else {
      status.textContent = 'Error: Please click inside a textarea first!';
    }
  };
  panel.appendChild(fillFocusedBtn);

  // Auto loop action
  const autoBtn = document.createElement('button');
  autoBtn.style.width = '100%';
  autoBtn.style.padding = '12px';
  autoBtn.style.background = '#7C6EF8';
  autoBtn.style.border = 'none';
  autoBtn.style.color = 'white';
  autoBtn.style.fontWeight = 'bold';
  autoBtn.style.borderRadius = '6px';
  autoBtn.style.cursor = 'pointer';
  autoBtn.textContent = '🚀 Start Auto-Loop';
  autoBtn.onclick = async () => {
    autoBtn.disabled = true;
    autoBtn.style.background = '#5B5B6A';
    status.textContent = 'Running auto loop automation...';

    // Helper delay
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const mapping = {
      'iw': 'he',
      'fil': 'tl',
      'zh-CN': 'zh_CN',
      'zh-TW': 'zh_TW'
    };

    // Locate the dropdown selector
    const combobox = document.querySelector('div[role="combobox"]');
    if (!combobox) {
      status.textContent = 'Error: Dropdown combobox not found on page!';
      autoBtn.disabled = false;
      autoBtn.style.background = '#7C6EF8';
      return;
    }

    // Loop through list values
    combobox.click();
    await delay(1000);

    const options = Array.from(document.querySelectorAll('li[role="option"]'));
    status.textContent = \`Found \${options.length} languages to fill...\`;
    combobox.click(); // Close initial
    await delay(500);

    for (let i = 0; i < options.length; i++) {
      combobox.click();
      await delay(800);
      
      const opts = Array.from(document.querySelectorAll('li[role="option"]'));
      const opt = opts[i];
      if (!opt) continue;

      const rawVal = opt.getAttribute('data-value') || '';
      let loc = rawVal;
      // Map regional code if present or fallback
      if (mapping[rawVal]) {
        loc = mapping[rawVal];
      } else if (rawVal.includes('-')) {
        loc = rawVal.split('-')[0];
      }

      const descText = DESCRIPTIONS[loc] || DESCRIPTIONS[loc.split('_')[0]] || DESCRIPTIONS['en'];
      
      status.textContent = \`Filling [\${i+1}/\${options.length}] - Locale \${rawVal}...\`;
      opt.click();
      await delay(2500); // Allow textareas to load

      // Find the longest visible textarea
      const textareas = Array.from(document.querySelectorAll('textarea'))
        .filter(t => t.offsetParent !== null);
      
      if (textareas.length > 0) {
        // Find by index or choose longest
        let target = textareas[0];
        let maxLen = -1;
        textareas.forEach(t => {
          if (t.value.length > maxLen) {
            maxLen = t.value.length;
            target = t;
          }
        });

        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
        setter.call(target, descText);
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }
      await delay(1000);
    }

    status.textContent = 'Auto filling process complete!';
    autoBtn.disabled = false;
    autoBtn.style.background = '#7C6EF8';
  };
  panel.appendChild(autoBtn);

  document.body.appendChild(panel);
  console.log("✨ AI Rewrite Auto-Filler Panel Injected successfully!");
})();`;

  fs.writeFileSync(
    path.join(__dirname, 'cws_auto_filler.js'),
    autoFillerScript,
    'utf8'
  );
  console.log("Successfully generated extension/cws_auto_filler.js");
}

run().catch(console.error);
