import mongoose, { Schema, Document } from 'mongoose';

export interface IUsage extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // 'YYYY-MM-DD'
  rewriteCount: number;
}

const UsageSchema = new Schema<IUsage>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  rewriteCount: { type: Number, default: 0 },
});

// Unique index per user per day
UsageSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Usage = mongoose.model<IUsage>('Usage', UsageSchema);
