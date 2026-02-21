import { Comment } from '../../domain/entities/Comment';
import { ICommentRepository } from '../../domain/repositories/ICommentRepository';
import { CommentModel } from '../database/models/CommentModel';

export class MongoCommentRepository implements ICommentRepository {
  private toDomain(doc: any): Comment {
    return Comment.create({
      id: doc._id.toString(),
      nameId: doc.nameId.toString(),
      userId: doc.userId.toString(),
      text: doc.text,
      parentId: doc.parentId ? doc.parentId.toString() : null,
      createdAt: doc.createdAt,
    });
  }

  async findById(id: string): Promise<Comment | null> {
    const doc = await CommentModel.findById(id);
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByNameId(nameId: string): Promise<Comment[]> {
    const docs = await CommentModel.find({ nameId }).sort({ createdAt: 1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findReplies(parentId: string): Promise<Comment[]> {
    const docs = await CommentModel.find({ parentId }).sort({ createdAt: 1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(comment: Comment): Promise<Comment> {
    const doc = await CommentModel.create({
      nameId: comment.nameId,
      userId: comment.userId,
      text: comment.text,
      parentId: comment.parentId,
    });
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await CommentModel.findByIdAndDelete(id);
    return result !== null;
  }
}
