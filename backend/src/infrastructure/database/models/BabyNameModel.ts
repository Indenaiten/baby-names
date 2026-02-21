import mongoose, { Schema, Document } from 'mongoose';

export interface IBabyNameDocument extends Document {
  name: string;
  gender: string;
  proposedBy: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  averageScore: number;
  totalRatings: number;
  createdAt: Date;
}

const BabyNameSchema = new Schema<IBabyNameDocument>(
  {
    name: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['boy', 'girl', 'unisex'], required: true },
    proposedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    averageScore: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BabyNameSchema.index({ groupId: 1, gender: 1 });
BabyNameSchema.index({ groupId: 1, name: 1 }, { unique: true });
BabyNameSchema.index({ proposedBy: 1 });

export const BabyNameModel = mongoose.model<IBabyNameDocument>('BabyName', BabyNameSchema);
