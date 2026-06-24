type RewriteMode = 'improve' | 'grammar' | 'professional' | 'friendly' | 'formal' | 'casual' | 'persuasive' | 'confident' | 'shorten' | 'expand' | 'simplify' | 'humanize' | 'custom';

export const PROMPTS: Record<RewriteMode, string> = {
  improve:
    'Rewrite the following text to improve clarity, flow, readability, and structure. Ensure the original meaning is preserved while making the language more elegant. Provide ONLY the rewritten text without any conversational filler or formatting.',
  grammar:
    'Correct all grammatical, spelling, punctuation, and structural errors. Maintain the original tone and meaning perfectly. Provide ONLY the corrected text without any conversational filler or formatting.',
  professional:
    'Rewrite the text in a polished, professional business tone suitable for the workplace. Maintain clarity and respectfulness. Provide ONLY the rewritten text without any conversational filler or formatting.',
  friendly:
    'Rewrite the text in a warm, welcoming, and friendly conversational tone. Make it sound approachable and positive. Provide ONLY the rewritten text without any conversational filler or formatting.',
  formal:
    'Rewrite the text in a highly formal, academic, or corporate tone. Eliminate colloquialisms, slang, and contractions. Provide ONLY the rewritten text without any conversational filler or formatting.',
  casual:
    'Rewrite the text in a relaxed, casual, and natural everyday tone. Make it sound like a message to a friend. Provide ONLY the rewritten text without any conversational filler or formatting.',
  persuasive:
    'Rewrite the text to be highly persuasive, compelling, and engaging. Optimize it for marketing, sales, or driving action. Provide ONLY the rewritten text without any conversational filler or formatting.',
  confident:
    'Rewrite the text with strong authority, conviction, and assertiveness. Remove any hedging, passive, or unsure language. Provide ONLY the rewritten text without any conversational filler or formatting.',
  shorten:
    'Condense and shorten the text to be as concise as possible. Remove fluff and redundancy while preserving the core meaning and key details. Provide ONLY the shortened text without any conversational filler or formatting.',
  expand:
    'Expand the text by adding relevant details, context, and elaboration to make it more comprehensive. Provide ONLY the expanded text without any conversational filler or formatting.',
  simplify:
    'Rewrite the text using plain, simple, and accessible language. Avoid jargon and complex vocabulary so that anyone can easily understand it. Provide ONLY the simplified text without any conversational filler or formatting.',
  humanize:
    'Rewrite this text to sound completely natural and authentically human-written. Vary the sentence length and structure, add natural conversational flow, and remove any robotic or formulaic patterns. Provide ONLY the rewritten text without any conversational filler or formatting.',
  custom: '', // replaced at runtime with user's custom prompt
};

export function getSystemPrompt(mode: RewriteMode, customPrompt?: string): string {
  if (mode === 'custom') {
    if (!customPrompt || customPrompt.trim().length === 0) {
      throw new Error('Custom prompt is required for custom mode');
    }
    return customPrompt.trim();
  }
  return PROMPTS[mode];
}
