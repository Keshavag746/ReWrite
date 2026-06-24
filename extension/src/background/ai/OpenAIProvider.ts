import { AIProvider } from './AIProvider';
import { AIModel, RewriteMode } from '../../shared/types/index';
import { getStoredJWT } from '../auth/googleAuth';

const BACKEND_URL = 'http://localhost:3001';

export class OpenAIProvider implements AIProvider {
  modelName: AIModel = 'gpt-5-mini';

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  async rewrite(text: string, mode: RewriteMode, customPrompt?: string): Promise<string> {
    const jwt = await getStoredJWT();
    const res = await fetch(`${BACKEND_URL}/api/rewrite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ text, mode, customPrompt, model: this.modelName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(err.error ?? `OpenAI provider failed with status ${res.status}`);
    }
    const data = await res.json() as { output: string };
    return data.output;
  }
}
