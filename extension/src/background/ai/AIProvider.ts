import { AIModel, RewriteMode } from '../../shared/types/index';

export interface AIProvider {
  modelName: AIModel;
  rewrite(text: string, mode: RewriteMode, customPrompt?: string): Promise<string>;
  isAvailable(): Promise<boolean>;
}
