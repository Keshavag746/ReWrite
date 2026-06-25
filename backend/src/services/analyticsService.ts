export interface RewriteEventProps {
  userId: string;
  mode: string;
  modelUsed: string;
  switchedFrom?: string;
  tokensUsed?: number;
  plan: string;
}

export function trackRewrite(props: RewriteEventProps): void {
  console.log(`[Analytics] Rewrite completed - User: ${props.userId}, Mode: ${props.mode}, Model: ${props.modelUsed}, Tokens: ${props.tokensUsed}`);
}

export function trackLogin(userId: string, plan: string): void {
  console.log(`[Analytics] User login - User: ${userId}, Plan: ${plan}`);
}

export function trackLimitReached(userId: string, count: number): void {
  console.log(`[Analytics] Daily limit reached - User: ${userId}, Count: ${count}`);
}

export async function shutdownAnalytics(): Promise<void> {
  // No-op since we don't have a third-party client to flush
  return Promise.resolve();
}

