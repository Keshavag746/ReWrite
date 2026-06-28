// Service worker entry point — imports register all listeners
import './messaging/messageHandler';
import { RewriteMode } from '../shared/types/index';
import contentScriptUrl from '../content/index.tsx?script';

// ─── Context Menus ────────────────────────────────────────────────────────────
const REWRITE_MODES: RewriteMode[] = [
  'improve', 'grammar', 'professional', 'friendly', 'formal', 'casual',
  'persuasive', 'confident', 'shorten', 'expand', 'simplify', 'humanize', 'custom'
];

chrome.runtime.onInstalled.addListener((details) => {
  // Set uninstall URL
  chrome.runtime.setUninstallURL(
    'https://docs.google.com/forms/d/e/1FAIpQLSezTnAZjAIOLXFYB9w-PcDE2GOdYfEmkgFZ-YYdRFmpDvifyA/viewform?usp=publish-editor'
  );

  // Open options page on initial installation
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }

  // Create parent menu item
  chrome.contextMenus.create({
    id: 'ai-rewrite-parent',
    title: chrome.i18n.getMessage('contextMenuParent'),
    contexts: ['selection'],
  });

  // Create child items for each mode
  for (const modeId of REWRITE_MODES) {
    const key = (modeId === 'shorten' || modeId === 'expand' || modeId === 'simplify')
      ? `mode_${modeId}`
      : `contextMenu_${modeId}`;
    chrome.contextMenus.create({
      id: `ai-rewrite-${modeId}`,
      parentId: 'ai-rewrite-parent',
      title: chrome.i18n.getMessage(key),
      contexts: ['selection'],
    });
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const itemId = info.menuItemId as string;
  if (!itemId.startsWith('ai-rewrite-') || itemId === 'ai-rewrite-parent') return;

  const mode = itemId.replace('ai-rewrite-', '') as RewriteMode;
  const selectedText = info.selectionText ?? '';

  if (!tab?.id) return;

  // Inject content script if needed and send message
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [contentScriptUrl],
    });
  } catch (err) {
    console.error('Failed to inject content script:', err);
  }

  chrome.tabs.sendMessage(tab.id, {
    type: 'OPEN_REWRITE_POPUP',
    payload: { text: selectedText, mode },
  });
});

// Handle keyboard command (Ctrl+Shift+K)
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'open-command-palette') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [contentScriptUrl],
    });
  } catch (err) {
    console.error('Failed to inject content script for command palette:', err);
  }

  chrome.tabs.sendMessage(tab.id, { type: 'OPEN_COMMAND_PALETTE' });
});
