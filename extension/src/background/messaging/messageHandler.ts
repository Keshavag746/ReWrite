import { ChromeMessage, RewriteRequest } from '../../shared/types/index';
import { rewriteWithFallback } from '../ai/AIProviderFactory';
import { loginWithGoogle, logout, getStoredUser } from '../auth/googleAuth';

const BACKEND_URL = 'http://140.245.6.232:3001';

async function getJWT(): Promise<string> {
  const result = await chrome.storage.local.get('ai_rewrite_jwt');
  return (result['ai_rewrite_jwt'] as string) ?? '';
}

chrome.runtime.onMessage.addListener(
  (message: ChromeMessage, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse).catch((err: Error) => {
      sendResponse({ error: err.message });
    });
    return true; // Keep message channel open for async response
  }
);

async function handleMessage(message: ChromeMessage): Promise<unknown> {
  switch (message.type) {
    case 'REWRITE_TEXT': {
      const req = message.payload as RewriteRequest;
      return rewriteWithFallback(req.text, req.mode, undefined, req.customPrompt);
    }

    case 'GET_USER': {
      return getStoredUser();
    }

    case 'GET_HISTORY': {
      const jwt = await getJWT();
      const { page = 1, limit = 20 } = (message.payload as { page?: number; limit?: number }) ?? {};
      const res = await fetch(
        `${BACKEND_URL}/api/history?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      return res.json();
    }

    case 'DELETE_HISTORY_ITEM': {
      const jwt = await getJWT();
      const { id } = message.payload as { id: string };
      const res = await fetch(`${BACKEND_URL}/api/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.json();
    }

    case 'CLEAR_HISTORY': {
      const jwt = await getJWT();
      const res = await fetch(`${BACKEND_URL}/api/history/all`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.json();
    }

    case 'OPEN_SIDEPANEL': {
      // Get current tab and open side panel
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.windowId !== undefined) {
        await chrome.sidePanel.open({ windowId: tab.windowId });
      }
      return { success: true };
    }

    case 'AUTH_LOGIN': {
      return loginWithGoogle();
    }

    case 'AUTH_LOGOUT': {
      await logout();
      return { success: true };
    }

    default:
      throw new Error(`Unknown message type: ${(message as ChromeMessage).type}`);
  }
}
