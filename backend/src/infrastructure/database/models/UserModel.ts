import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['root', 'admin', 'user'], default: 'user' },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
