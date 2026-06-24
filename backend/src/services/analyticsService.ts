import { PostHog } from 'posthog-node';

let client: PostHog | null = null;

function getClient(): PostHog | null {
  if (!process.env.POSTHOG_API_KEY) return null;
  if (!client) {
    client = new PostHog(process.env.POSTHOG_API_KEY, {
      host: 'https://app.posthog.com',
    });
  }
  return client;
}

export interface RewriteEventProps {
  userId: string;
  mode: string;
  modelUsed: string;
  switchedFrom?: string;
  tokensUsed?: number;
  plan: string;
}

export function trackRewrite(props: RewriteEventProps): void {
  const posthog = getClient();
  if (!posthog) return;
  posthog.capture({
    distinctId: props.userId,
    event: 'rewrite_completed',
    properties: {
      mode: props.mode,
      model_used: props.modelUsed,
      switched_from: props.switchedFrom,
      tokens_used: props.tokensUsed,
      plan: props.plan,
    },
  });
}

export function trackLogin(userId: string, plan: string): void {
  const posthog = getClient();
  if (!posthog) return;
  posthog.capture({
    distinctId: userId,
    event: 'user_login',
    properties: { plan },
  });
}

export function trackLimitReached(userId: string, count: number): void {
  const posthog = getClient();
  if (!posthog) return;
  posthog.capture({
    distinctId: userId,
    event: 'daily_limit_reached',
    properties: { count },
  });
}

export async function shutdownAnalytics(): Promise<void> {
  if (client) {
    await client.shutdown();
  }
}
