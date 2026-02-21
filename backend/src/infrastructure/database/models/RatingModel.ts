import mongoose, { Schema, Document } from 'mongoose';

export interface IRatingDocument extends Document {
  nameId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  score: number;
  createdAt: Date;
}

const RatingSchema = new Schema<IRatingDocument>(
  {
    nameId: { type: Schema.Types.ObjectId, ref: 'BabyName', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, min: 1, max: 10 },
  },
  { timestamps: true }
);

RatingSchema.index({ nameId: 1, userId: 1 }, { unique: true });
RatingSchema.index({ userId: 1 });

export const RatingModel = mongoose.model<IRatingDocument>('Rating', RatingSchema);
