export type RewriteMode =
  | 'improve'
  | 'grammar'
  | 'professional'
  | 'friendly'
  | 'formal'
  | 'casual'
  | 'persuasive'
  | 'confident'
  | 'shorten'
  | 'expand'
  | 'simplify'
  | 'humanize'
  | 'custom';

export type AIModel = 'gpt-oss-120b' | 'groq-llama';

export type UserPlan = 'free' | 'pro';

export interface RewriteRequest {
  text: string;
  mode: RewriteMode;
  customPrompt?: string; // only for mode === 'custom'
  model?: AIModel;
}

export interface RewriteResponse {
  output: string;
  modelUsed: AIModel;
  tokensUsed?: number;
  switchedFrom?: AIModel;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  selectedModel: AIModel;
  dailyUsageCount: number;
}

export interface RewriteHistoryItem {
  id: string;
  originalText: string;
  rewrittenText: string;
  mode: RewriteMode;
  modelUsed: AIModel;
  createdAt: string;
}

// Chrome message types
export type MessageType =
  | 'REWRITE_TEXT'
  | 'GET_USER'
  | 'GET_HISTORY'
  | 'OPEN_SIDEPANEL'
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT';

export interface ChromeMessage {
  type: MessageType;
  payload?: unknown;
}

export interface UsageInfo {
  count: number;
  limit: number;
  plan: UserPlan;
  resetAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedHistory {
  items: RewriteHistoryItem[];
  page: number;
  total: number;
  hasMore: boolean;
}
