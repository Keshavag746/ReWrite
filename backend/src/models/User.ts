import mongoose, { Schema, Document } from 'mongoose';

type AIModel = 'gpt-oss-120b';
type UserPlan = 'free' | 'pro' | 'weekly' | 'monthly' | 'yearly';

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  plan: UserPlan;
  selectedModel: AIModel;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    plan: { type: String, enum: ['free', 'pro', 'weekly', 'monthly', 'yearly'], default: 'free' },
    selectedModel: {
      type: String,
      enum: ['gpt-oss-120b'],
      default: 'gpt-oss-120b',
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
