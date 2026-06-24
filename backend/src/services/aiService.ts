import OpenAI from 'openai';

import { getSystemPrompt } from '../utils/prompts';

type RewriteMode = 'improve' | 'grammar' | 'professional' | 'friendly' | 'formal' | 'casual' | 'persuasive' | 'confident' | 'shorten' | 'expand' | 'simplify' | 'humanize' | 'custom';

export interface AIServiceResult {
  output: string;
  modelUsed: string;
  tokensUsed?: number;
}

// Sanitize input: strip scripts, limit to 5000 chars
function sanitizeText(text: string): string {
  return text
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
    .slice(0, 5000);
}

export async function rewriteWithAI(
  text: string,
  mode: RewriteMode,
  _preferredModel?: string,
  customPrompt?: string
): Promise<AIServiceResult> {
  const sanitized = sanitizeText(text);
  const systemPrompt = getSystemPrompt(mode, customPrompt);

  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  const response = await client.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ],
    max_tokens: 2000,
  });

  return {
    output: response.choices[0]?.message?.content ?? '',
    modelUsed: 'gpt-oss-120b',
    tokensUsed: response.usage?.total_tokens,
  };
}
