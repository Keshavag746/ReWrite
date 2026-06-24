import { RewriteMode } from '../types/index';

export const REWRITE_MODE_LABELS: Record<RewriteMode, string> = {
  improve: '✨ Improve',
  grammar: '✅ Grammar',
  professional: '💼 Professional',
  friendly: '😊 Friendly',
  formal: '🎩 Formal',
  casual: '👋 Casual',
  persuasive: '🎯 Persuasive',
  confident: '💪 Confident',
  shorten: '✂️ Shorten',
  expand: '📖 Expand',
  simplify: '🔤 Simplify',
  humanize: '🤖 Humanize',
  custom: '⚡ Custom',
};

export const ALL_REWRITE_MODES: RewriteMode[] = [
  'improve','grammar','professional','friendly','formal','casual',
  'persuasive','confident','shorten','expand','simplify','humanize','custom',
];
