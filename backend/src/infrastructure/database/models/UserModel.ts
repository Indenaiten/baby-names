import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  username: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, default: '', trim: true },
    lastName: { type: String, default: '', trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['root', 'admin', 'user'], default: 'user' },
  },
  { timestamps: true }
);

UserSchema.index({ username: 1 });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
