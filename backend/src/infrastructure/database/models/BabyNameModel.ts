import mongoose, { Schema, Document } from 'mongoose';

export interface IBabyNameDocument extends Document {
  name: string;
  gender: string;
  proposedBy: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  averageScore: number;
  totalRatings: number;
  description?: string;
  decisions: {
    userId: mongoose.Types.ObjectId;
    type: string;
    createdAt: Date;
  }[];
  isWinner: boolean;
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
    description: { type: String, trim: true },
    decisions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['like', 'dislike'], required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isWinner: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BabyNameSchema.index({ groupId: 1, gender: 1 });
BabyNameSchema.index({ groupId: 1, name: 1 }, { unique: true });
BabyNameSchema.index({ proposedBy: 1 });

export const BabyNameModel = mongoose.model<IBabyNameDocument>('BabyName', BabyNameSchema);
