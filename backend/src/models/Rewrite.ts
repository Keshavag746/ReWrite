import mongoose, { Schema, Document } from 'mongoose';

type AIModel = 'gpt-oss-120b';
type RewriteMode = 'improve' | 'grammar' | 'professional' | 'friendly' | 'formal' | 'casual' | 'persuasive' | 'confident' | 'shorten' | 'expand' | 'simplify' | 'humanize' | 'custom';

export interface IRewrite extends Document {
  userId: mongoose.Types.ObjectId;
  originalText: string;
  rewrittenText: string;
  mode: RewriteMode;
  modelUsed: AIModel;
  createdAt: Date;
}

const RewriteSchema = new Schema<IRewrite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalText: { type: String, required: true, maxlength: 5000 },
    rewrittenText: { type: String, required: true },
    mode: {
      type: String,
      enum: [
        'improve','grammar','professional','friendly','formal','casual',
        'persuasive','confident','shorten','expand','simplify','humanize','custom',
      ],
      required: true,
    },
    modelUsed: {
      type: String,
      enum: ['gpt-oss-120b'],
      required: true,
    },
  },
  { timestamps: true }
);

export const Rewrite = mongoose.model<IRewrite>('Rewrite', RewriteSchema);
