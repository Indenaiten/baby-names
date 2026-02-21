import { Comment } from '../entities/Comment';

export interface ICommentRepository {
  findById(id: string): Promise<Comment | null>;
  findByNameId(nameId: string): Promise<Comment[]>;
  findReplies(parentId: string): Promise<Comment[]>;
  create(comment: Comment): Promise<Comment>;
  delete(id: string): Promise<boolean>;
}
