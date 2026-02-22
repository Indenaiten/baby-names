import { Comment } from '../../domain/entities/Comment';
import { ICommentRepository } from '../../domain/repositories/ICommentRepository';
import { CommentModel } from '../database/models/CommentModel';

export class MongoCommentRepository implements ICommentRepository {
  private toDomain(doc: any): Comment {
    const userObj = typeof doc.userId === 'object' && doc.userId._id
      ? doc.userId
      : { _id: doc.userId };

    const fullName = [userObj.firstName, userObj.lastName]
      .filter(Boolean)
      .join(' ');

    const userDisplay = fullName
      ? `${fullName} (@${userObj.username})`
      : userObj.username;

    return Comment.create({
      id: doc._id.toString(),
      nameId: doc.nameId.toString(),
      userId: userObj._id.toString(),
      userName: userDisplay,
      text: doc.text,
      parentId: doc.parentId ? doc.parentId.toString() : null,
      createdAt: doc.createdAt,
    });
  }

  async findById(id: string): Promise<Comment | null> {
    const doc = await CommentModel.findById(id).populate('userId', 'username firstName lastName');
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByNameId(nameId: string): Promise<Comment[]> {
    const docs = await CommentModel.find({ nameId }).sort({ createdAt: 1 }).populate('userId', 'username firstName lastName');
    return docs.map((doc) => this.toDomain(doc));
  }

  async findReplies(parentId: string): Promise<Comment[]> {
    const docs = await CommentModel.find({ parentId }).sort({ createdAt: 1 }).populate('userId', 'username firstName lastName');
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(comment: Comment): Promise<Comment> {
    const doc = await CommentModel.create({
      nameId: comment.nameId,
      userId: comment.userId,
      text: comment.text,
      parentId: comment.parentId,
    });
    // Populate user info after creation
    await doc.populate('userId', 'username firstName lastName');
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await CommentModel.findByIdAndDelete(id);
    return result !== null;
  }
}
