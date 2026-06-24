// Service worker entry point — imports register all listeners
import './messaging/messageHandler';
import { RewriteMode } from '../shared/types/index';

// ─── Context Menus ────────────────────────────────────────────────────────────
const REWRITE_MODES: { id: RewriteMode; title: string }[] = [
  { id: 'improve', title: '✨ Improve Writing' },
  { id: 'grammar', title: '✅ Fix Grammar' },
  { id: 'professional', title: '💼 Make Professional' },
  { id: 'friendly', title: '😊 Make Friendly' },
  { id: 'formal', title: '🎩 Make Formal' },
  { id: 'casual', title: '👋 Make Casual' },
  { id: 'persuasive', title: '🎯 Make Persuasive' },
  { id: 'confident', title: '💪 Make Confident' },
  { id: 'shorten', title: '✂️ Shorten' },
  { id: 'expand', title: '📖 Expand' },
  { id: 'simplify', title: '🔤 Simplify' },
  { id: 'humanize', title: '🤖→👤 Humanize' },
  { id: 'custom', title: '⚡ Custom Prompt...' },
];

chrome.runtime.onInstalled.addListener(() => {
  // Create parent menu item
  chrome.contextMenus.create({
    id: 'ai-rewrite-parent',
    title: 'AI Rewrite →',
    contexts: ['selection'],
  });

  // Create child items for each mode
  for (const mode of REWRITE_MODES) {
    chrome.contextMenus.create({
      id: `ai-rewrite-${mode.id}`,
      parentId: 'ai-rewrite-parent',
      title: mode.title,
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
      files: ['src/content/index.tsx'],
    });
  } catch {
    // Content script may already be injected — that's OK
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
      files: ['src/content/index.tsx'],
    });
  } catch {
    // Already injected
  }

  chrome.tabs.sendMessage(tab.id, { type: 'OPEN_COMMAND_PALETTE' });
});
