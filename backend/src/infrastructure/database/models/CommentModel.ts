import mongoose, { Schema, Document } from 'mongoose';

export interface ICommentDocument extends Document {
  nameId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  parentId: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const CommentSchema = new Schema<ICommentDocument>(
  {
    nameId: { type: Schema.Types.ObjectId, ref: 'BabyName', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
  },
  { timestamps: true }
);

CommentSchema.index({ nameId: 1 });
CommentSchema.index({ parentId: 1 });

export const CommentModel = mongoose.model<ICommentDocument>('Comment', CommentSchema);
