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
  createdAt: Date;
}

const GroupMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    status: { type: String, enum: ['active', 'pending', 'invited'], default: 'active' },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const GroupSchema = new Schema<IGroupDocument>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [GroupMemberSchema],
  },
  { timestamps: true }
);

GroupSchema.index({ 'members.userId': 1 });

export const GroupModel = mongoose.model<IGroupDocument>('Group', GroupSchema);
