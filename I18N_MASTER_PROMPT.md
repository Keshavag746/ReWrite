# Master Prompt: Comprehensive Chrome Extension Localization & CWS Automation

This prompt is designed to guide an AI agent to **fully localize a Chrome Extension's entire codebase** (including Manifest, HTML, CSS, JS, and Store Listing) for all Google Chrome Web Store (CWS) supported locales and generate a robust automation script for the CWS Developer Dashboard.

## **Objective**
Localize the entire extension codebase (HTML, JS, Manifest) for all **CWS Supported Locales** and provide a tool to automate the entry of these translations into the Chrome Web Store dashboard.

## **Context**
*   **Target Application**: A Chrome Extension.
*   **Goal**: Maximize global reach by translating Store Listing descriptions AND all internal extension UI strings (Popup, Options, Content Scripts, etc.).
*   **Deliverables**:
    1.  Fully localized `manifest.json`.
    2.  Fully localized HTML/JS files (hardcoded strings replaced with `__MSG_...__` or `chrome.i18n.getMessage`).
    3.  Updated `_locales/` directory with `messages.json` containing ALL UI strings for all languages.
    4.  A robust `cws_auto_filler.js` script to automate the "Store Listing" form filling.

---

## **Supported Locales (Review Strictly)**

**CRITICAL**: You must ONLY support the following **61 languages**. This list is sourced from a verified extension (`coupon-clipper`). Do not add or remove languages from this list unless explicitly instructed.

**Do NOT** use regional codes like `en_US` or `en_GB`. Use the 2-letter codes unless listed otherwise (e.g., `pt`, `zh_CN`, `zh_TW`).

```json
[
  "am", "ar", "az", "bg", "bn", "cs", "da", "de", "el", "en", 
  "es", "fa", "fi", "fr", "gu", "ha", "he", "hi", "hr", "hu", 
  "id", "ig", "it", "ja", "jv", "kk", "km", "kn", "ko", "lt", 
  "ml", "mr", "my", "ne", "nl", "no", "pa", "pl", "ps", "pt", 
  "ro", "ru", "sd", "si", "sk", "sl", "sv", "sw", "ta", "te", 
  "th", "tl", "tr", "uk", "ur", "uz", "vi", "yo", "zh_CN", "zh_TW", 
  "zu"
]
```

---

## **Phase 1: Codebase Analysis & String Extraction**

1.  **Analyze `manifest.json`**:
    *   Ensure `default_locale` is set (e.g., `"en"`).
    *   Identify fields like `"name"`, `"description"`, `"default_title"`.
2.  **Scan Codebase for UI Strings**:
    *   **HTML Files** (`popup.html`, `options.html`): Look for hardcoded text inside `<p>`, `<span>`, `<h1>`, buttons, labels, etc.
    *   **JS Files** (`popup.js`, `options.js`, `content.js`, `background.js`): Look for hardcoded strings in variables, `innerHTML`, `textContent`, alert messages, console logs (optional), and toast notifications.
3.  **Create English Base**:
    *   Extract all found strings into keys (e.g., `popupTitle`, `btnSave`, `toastMsg`).
    *   Populate `_locales/en/messages.json`.

## **Phase 2: Code Modification (The "i18n" Refactor)**

1.  **HTML Refactor**:
    *   Replace hardcoded text with `data-i18n="keyName"`.
    *   Ensure a script (e.g., `popup.js`, `options.js`) has logic to find these elements and set `textContent` using `chrome.i18n.getMessage`.
2.  **JS Refactor**:
    *   Replace hardcoded strings with `chrome.i18n.getMessage('keyName')`.
3.  **Manifest Refactor**:
    *   Replace `"name"` with `"__MSG_appName__"`.
    *   Replace `"description"` with `"__MSG_appDesc__"`.

## **Phase 3: Translation & File Generation**

**Instruction to Agent:**
"Iterate through the `SUPPORTED_LOCALES` list. For each locale (excluding the default `en`):"

1.  **Create Directory**: `_locales/[code]/`.
2.  **Generate `messages.json`**:
    *   Translate ALL values from `_locales/en/messages.json` (Extension Name, Description, UI Strings).
    *   **CRITICAL: Translate the Extension Name (`appName`) into the target language.** Do NOT leave it in English (e.g., "Scroll Buttons" -> "Botones de desplazamiento").
    *   **CRITICAL: Translate the Description (`appDesc`) to match the target language.**
    *   **NO ENGLISH FALLBACKS**: Run a check to ensure `appName` and `appDesc` are not identical to `en` values (unless the language is an English variant).
    *   **Rules**:
        *   **APP NAME INTEGRITY**: The English (`en`) `appName` MUST be the **FULL** product title provided by the user (e.g., "Twitter/X Manager – Likes, Retweets & Cleanup"). **DO NOT TRUNCATE IT.**
        *   **STRICT JSON STRUCTURE**: Ensure `message` values are simple strings. **DO NOT** create nested objects like `{"message": {"message": "..."}}`.
            *   **CORRECT**: `"key": { "message": "My Text", "description": "..." }`
            *   **WRONG**: `"key": { "message": { "message": "My Text" } }`
        *   Keep usage of `<br>`, `<strong>` tags intact.
        *   Do NOT translate placeholders like `$1`, `$COUNT$`.
        *   Keep the structure exactly the same as the English file.
        *   **CRITICAL**: Ensure value length limits are respected (e.g., Extension Name < 45 chars, Summary < 132 chars).
3.  **Specific Locale Fixes**:
    *   Use `zh_CN` for Simplified Chinese, `zh_TW` for Traditional.
    *   Use `pt` (not `pt_BR` or `pt_PT` unless required by specific context, but standard list uses `pt`).
    *   Adjust `he` (Hebrew) vs `iw` compatibility if needed.

## **Phase 4: CWS Auto-Filler Script Generation**

**Instruction to Agent:**
"Create a file named `cws_auto_filler.js`. This script will be pasted by the user into the Chrome DevTools Console on the CWS Dashboard to automate data entry."

**Capabilities of `cws_auto_filler.js`:**
1.  **Embed Translations**: Store translated **Long Descriptions** (from `WEBSTORE_LISTING.md`) in a constant object `DESCRIPTIONS` keyed by locale.
    *   **CRITICAL REQUIREMENT**: You MUST generate the translations for **ALL CWS SUPPORTED LOCALES** (approx 61).
    *   **LOCALIZED PRODUCT NAMES**: Ensure the description text uses the **localized product name** (from `messages.json`) instead of the English name.
    *   **NO SHORTCUTS**: Do NOT use comments like `// fill other languages here`. You must explicitly generate every single string.
    *   **Chunking**: If the file is too large, use multiple `replace_file_content` steps to populate the object in batches (e.g., Batch 1: A-I, Batch 2: J-Z).
2.  **UI Helper Panel**: Inject a floating GUI panel (`position: fixed`) into the page with:
    *   A Dropdown to select language manually.
    *   A 'Start Auto-Loop' button.
    *   A 'Fill Focused Box' button.
    *   **CRITICAL - TRUSTED TYPE SECURITY**: Do **NOT** use `innerHTML` to dynamicallly create the UI panel or inject content into the page. The CWS dashboard enforces a strict "TrustedHTML" Content Security Policy (CSP). You **MUST** use `document.createElement()`, `element.textContent`, and `parentNode.appendChild()` to build the UI elements.
3.  **Robust Automation Logic**:
    *   **Dropdown Strategy**: Logic MUST explicitly re-open the dropdown (click `div[role="combobox"]`) on every iteration to ensure `li[role="option"]` elements are present in the DOM.
    *   **DOM-Ordered Iteration**: Iterate through the *actual* options found in the DOM (e.g., `document.querySelectorAll('li[role="option"]')`) to ensure matching order with the dashboard's display.
    *   **Value Extraction**: Use `data-value` attribute from list options to identify locale codes reliably.
    *   **Locale Mapping & Fallback**:
        *   Map codes: `iw` -> `he`, `fil` -> `tl`, `zh-CN` -> `zh_CN`, etc.
        *   **CRITICAL**: If a regional code (e.g. `es-419`) is selected by the automation but not in your `DESCRIPTIONS` map, fallback to the base language (e.g. `es`).
    *   **Strategic Timing**: Implement reliable delays:
        *   `1000ms` after initial dropdown click.
        *   `800ms` after each dropdown re-open.
        *   `2500ms` after clicking a language option (crucial for CWS to render the new textarea).
    *   **Targeting the Correct Textarea**: The CWS dashboard often has multiple textareas. Use a heuristic to find the correct one (e.g., **"The longest visible textarea"**). Search all `textareas` where `offsetParent !== null` and select the one with the maximum existing `value.length` or specifically matching indices if known.
    *   **Framework Injection**: Use the native value setter to bypass React/Angular state management:
        ```javascript
        const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
        valueSetter.call(target, text);
        target.dispatchEvent(new Event('input', { bubbles: true }));
        ```
    *   **Feedback**: Show clear Toast notifications (e.g., "Progress: 5/61") so the user knows the script is running. Use a persistent toast with updated `textContent` to avoid UI clutter.

## **Phase 5: Packaging & Delivery**

**Instruction to Agent:**
"Create a `package.sh` script to zip the extension for CWS submission."

*   **Recursive Zipping**: You **MUST** use `zip -r` (recursive) when adding the `_locales` directory.
    *   **CORRECT**: `zip -r extension.zip manifest.json _locales/ ...`
    *   **WRONG**: `zip extension.zip _locales` (this creates an empty folder in the zip).
*   **Manifest Check**: Ensure `manifest.json` has `"default_locale": "en"` if `_locales` is present.
