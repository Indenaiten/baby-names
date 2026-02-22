import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupDocument extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  members: {
    userId: mongoose.Types.ObjectId;
    role: string;
    status: string;
    joinedAt: Date;
  }[];
  parents: { firstName: string; lastName1: string; lastName2: string }[];
  siblings: { firstName: string; lastName1: string; lastName2: string }[];
  preferredSurnames?: { lastName1: string; lastName2: string };
  closed: boolean;
  createdAt: Date;
}

const FamilyMemberSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName1: { type: String, required: true, trim: true },
    lastName2: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const GroupMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    status: { type: String, enum: ['active', 'pending', 'invited'], default: 'active' },
    isInvolved: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const GroupSchema = new Schema<IGroupDocument>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [GroupMemberSchema],
    parents: [FamilyMemberSchema],
    siblings: [FamilyMemberSchema],
    preferredSurnames: {
      lastName1: { type: String, trim: true },
      lastName2: { type: String, trim: true },
    },
    closed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

GroupSchema.index({ 'members.userId': 1 });

export const GroupModel = mongoose.model<IGroupDocument>('Group', GroupSchema);
